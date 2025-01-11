const RebateDao = require("../dao/rebateDao");
const rebateDao = new RebateDao();
const logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");

/**
 * Controller for handling transactions.
 */
class TransactionController {
    /**
     * Submits a transaction.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>}
     */
    static async submitTransaction(req, res) {
        try {
            const transaction = await rebateDao.submitTransaction(req.body);
            logger.info("Transaction submitted successfully", transaction);
            return res.status(StatusCodes.CREATED).json(transaction);
        } catch (error) {
            logger.error("Error submitting transaction", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}

module.exports = TransactionController;