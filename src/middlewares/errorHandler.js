const logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");


/**
 * Error handling middleware.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
    logger.error("Internal server error: ", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
};

module.exports = errorHandler;