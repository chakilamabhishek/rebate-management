const RebateDao = require("../dao/rebateDao");
const rebateDao = new RebateDao();
const logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");

/**
 * Controller for handling rebate claims.
 */
class RebateClaimController {
    /**
     * Claims a rebate.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>}
     */
    static async claimRebate(req, res) {
        try {
            const claim = await rebateDao.claimRebate(req.body);
            logger.info("Rebate claimed created successfully", claim);
            return res.status(StatusCodes.CREATED).json(claim);
        } catch (error) {
            logger.error("Error in creating rebate", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    /**
     * Gets rebate claims within a date range.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>}
     */
    static async getRebateClaims(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const claims = await rebateDao.getRebateClaims(
                new Date(startDate),
                new Date(endDate)
            );
            logger.info("Fetched rebate claims", claims);
            return res.status(StatusCodes.OK).json(claims);
        } catch (error) {
            logger.error("Error fetching rebate claims", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    /**
     * Calculates the rebate for a transaction.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>}
     */
    static async calculateRebate(req, res) {
        try {
            const { transactionId } = req.params;
            const rebate = await rebateDao.calculateRebate(Number(transactionId));
            logger.info("Rebate calculated", { transactionId, rebate });
            return res.status(StatusCodes.OK).json({ rebate });
        } catch (error) {
            logger.error("Error calculating rebate", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}

module.exports = RebateClaimController;
