const { AppDataSource } = require("../../ormconfig");
const RebateProgram = require("../models/RebateProgram");
const Transaction = require("../models/Transaction");
const RebateClaim = require("../models/RebateClaim");
const logger = require("../utils/logger");
const { MAX_REBATE_PERCENTAGE } = require("../utils/constants");

class RebateDao {
    constructor() {
        this.rebateProgramRepo = AppDataSource.getRepository(RebateProgram);
        this.transactionRepo = AppDataSource.getRepository(Transaction);
        this.rebateClaimRepo = AppDataSource.getRepository(RebateClaim);
    }

    /**
     * Creates a new rebate program.
     * @param {Object} data - The data for the new rebate program.
     * @returns {Promise<Object>} The created rebate program.
     * @throws Will throw an error if creation fails.
     */
    async createRebateProgram(data) {
        try {
            logger.info("Creating rebate program");
            if (data.rebate_percentage > MAX_REBATE_PERCENTAGE) {
                throw new Error("Rebate percentage cannot be greater than " + MAX_REBATE_PERCENTAGE);
            }
            if (new Date(data.start_date) > new Date(data.end_date)) {
                throw new Error("Start date cannot be greater than end date");
            }
            const rebateProgram = this.rebateProgramRepo.create(data);
            return await this.rebateProgramRepo.save(rebateProgram);
        } catch (error) {
            logger.error("Error creating rebate program: ", error);
            throw new Error("Error creating rebate program: " + error.message);
        }
    }

    /**
     * Submits a new transaction.
     * @param {Object} data - The data for the new transaction.
     * @returns {Promise<Object>} The submitted transaction.
     * @throws Will throw an error if submission fails.
     */
    async submitTransaction(transactionData) {
        const rebateProgram = await this.rebateProgramRepo.findOne({ where: { id: transactionData.rebate_program_id, deleted_at: null } });
        if (!rebateProgram) {
            throw new Error("Rebate program not found or inactive");
        }

        const transactionDate = new Date(transactionData.transaction_date);
        if (transactionDate < new Date(rebateProgram.start_date) || transactionDate > new Date(rebateProgram.end_date)) {
            throw new Error("Transaction date is outside the rebate program period");
        }

        // Submit the transaction
        const transaction = this.transactionRepo.create(transactionData);
        const savedTransaction = await this.transactionRepo.save(transaction);
        return savedTransaction;
    }

    /**
     * Claims a rebate for a transaction.
     * @param {Object} data - The data for the rebate claim.
     * @returns {Promise<Object>} The claimed rebate.
     * @throws Will throw an error if claiming fails.
     */
    async claimRebate(data) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            logger.info("Claiming rebate for transaction ID: " + data.transaction_id);
            // Take a lock to ensure no other transaction can modify this record concurrently
            // Using advisory locking to avoid potential deadlocks and to have more control over the locking mechanism
            await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [data.transaction_id]);

            // Check if a rebate claim already exists for this transaction
            const existingClaim = await queryRunner.manager.findOne(RebateClaim, { where: { transaction_id: data.transaction_id, deleted_at: null } });
            if (existingClaim) throw new Error("Rebate claim already exists for this transaction!");

            // Retrieve the transaction details
            const transaction = await queryRunner.manager.findOne(Transaction, { where: { transaction_id: data.transaction_id, deleted_at: null } });
            if (!transaction) throw new Error("Transaction not found!");

            // Retrieve the rebate program details
            const rebateProgram = await queryRunner.manager.findOne(RebateProgram, { where: { id: transaction.rebate_program_id, deleted_at: null } });
            if (!rebateProgram) throw new Error("Rebate program not found!");

            // Calculate the claim amount based on the rebate percentage
            const claimAmount = transaction.amount * (rebateProgram.rebate_percentage / 100);
            const rebateClaim = queryRunner.manager.create(RebateClaim, { ...data, claim_amount: claimAmount });
            const savedClaim = await queryRunner.manager.save(RebateClaim, rebateClaim);

            await queryRunner.commitTransaction();
            return savedClaim;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            logger.error("Error claiming rebate: ", error);
            throw new Error("Error claiming rebate: " + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Retrieves rebate claims within a date range.
     * @param {string} startDate - The start date of the range.
     * @param {string} endDate - The end date of the range.
     * @returns {Promise<Object>} The list of rebate claims grouped by status and the total count.
     * @throws Will throw an error if retrieval fails.
     */
    async getRebateClaims(startDate, endDate) {
        try {
            logger.info("Getting rebate claims from " + startDate + " to " + endDate);
            
            if (new Date(startDate) > new Date(endDate)) {
                throw new Error("Start date cannot be greater than end date");
            }

            // Query to get the count of rebate claims grouped by status
            const result = await this.rebateClaimRepo
                .createQueryBuilder("rebateClaim")
                .select("claim_status, COUNT(claim_id) as count")
                .where("claim_date BETWEEN :start AND :end", { start: startDate, end: endDate })
                .andWhere("deleted_at IS NULL")
                .groupBy("claim_status")
                .getRawMany();

            const total = result.reduce((sum, record) => sum + parseInt(record.count), 0);

            // Query to get the top 10 recently created records for all tables
            const recentRebatePrograms = await this.rebateProgramRepo
                .createQueryBuilder("rebateProgram")
                .orderBy("created_at", "DESC")
                .limit(10)
                .getMany();

            const recentTransactions = await this.transactionRepo
                .createQueryBuilder("transaction")
                .orderBy("created_at", "DESC")
                .limit(10)
                .getMany();

            const recentRebateClaims = await this.rebateClaimRepo
                .createQueryBuilder("rebateClaim")
                .orderBy("created_at", "DESC")
                .limit(10)
                .getMany();

            return { 
                statusCounts: result, 
                total,
                recentRebatePrograms,
                recentTransactions,
                recentRebateClaims
            };
        } catch (error) {
            logger.error("Error getting rebate claims: ", error);
            throw new Error("Error getting rebate claims: " + error.message);
        }
    }

    /**
     * Calculates the rebate for a transaction.
     * @param {number} transactionId - The ID of the transaction.
     * @returns {Promise<number>} The calculated rebate amount.
     * @throws Will throw an error if calculation fails.
     */
    async calculateRebate(transactionId) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            logger.info("Calculating rebate for transaction ID: " + transactionId);
            // Take a lock to ensure no other transaction can modify this record concurrently
            // Using advisory locking to avoid potential deadlocks and to have more control over the locking mechanism
            await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [transactionId]);

            // Retrieve the transaction details
            const transaction = await queryRunner.manager.findOne(Transaction, { where: { transaction_id: transactionId, deleted_at: null } });
            if (!transaction) throw new Error("Transaction not found!");

            // Retrieve the rebate program details
            const rebateProgram = await queryRunner.manager.findOne(RebateProgram, { where: { id: transaction.rebate_program_id, deleted_at: null } });
            if (!rebateProgram) throw new Error("Rebate program not found!");

            // Calculate the rebate amount based on the rebate percentage
            const rebate = transaction.amount * (rebateProgram.rebate_percentage / 100);

            await queryRunner.commitTransaction();
            return rebate;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            logger.error("Error calculating rebate: ", error);
            throw new Error("Error calculating rebate: " + error.message);
        } finally {
            await queryRunner.release();
        }
    }
}

module.exports = RebateDao;