const RebateDao = require("../dao/rebateDao");
const rebateDao = new RebateDao();
const logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");

/**
 * Controller for handling rebate programs.
 */
class RebateProgramController {
    /**
     * Creates a new rebate program.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>}
     */
    static async createRebateProgram(req, res) {
        try {
            const program = await rebateDao.createRebateProgram(req.body);
            logger.info("Rebate program created successfully", program);
            return res.status(StatusCodes.OK).json(program); // Changed to 200
        } catch (error) {
            logger.error("Error creating rebate program", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}

module.exports = RebateProgramController;