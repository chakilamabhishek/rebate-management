const jwt = require("jsonwebtoken");
const config = require('../config');
const logger = require("../utils/logger");

/**
 * Middleware to validate JWT token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const jwtValidator = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        logger.warn("No token provided");
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            logger.error("Failed to authenticate token", err);
            return res.status(401).json({ message: "Failed to authenticate token" });
        }
        req.user = decoded.user;
        next();
    });
};

module.exports = jwtValidator;
