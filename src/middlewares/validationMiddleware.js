const { check, validationResult, body } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const validateTransaction = [
    check("amount").isNumeric().withMessage("Amount must be a number"),
    check("transaction_date").isISO8601().withMessage("Transaction date must be a valid date"),
    check("rebate_program_id").isInt().withMessage("Rebate program ID must be an integer"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

const validateRebateProgram = [
    check("program_name").isString().withMessage("Program name must be a string"),
    check("rebate_percentage").isNumeric().withMessage("Rebate percentage must be a number"),
    check("start_date").isISO8601().withMessage("Start date must be a valid date"),
    check("end_date").isISO8601().withMessage("End date must be a valid date"),
    body("start_date").custom((value, { req }) => {
        if (new Date(value) > new Date(req.body.end_date)) {
            throw new Error("Start date cannot be greater than end date");
        }
        return true;
    }),
    check("eligibility_criteria").isString().withMessage("Eligibility criteria must be a string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

const validateRebateClaim = [
    check("transaction_id").isInt().withMessage("Transaction ID must be an integer"),
    check("claim_date").isISO8601().withMessage("Claim date must be a valid date"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

const validateRebateClaimsQuery = [
    check("startDate").isISO8601().withMessage("Start date must be a valid date"),
    check("endDate").isISO8601().withMessage("End date must be a valid date"),
    body("startDate").custom((value, { req }) => {
        if (new Date(value) > new Date(req.body.endDate)) {
            throw new Error("Start date cannot be greater than end date");
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

const validateTransactionId = [
    check("transactionId").isInt().withMessage("Transaction ID must be an integer"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUser = [
    check("user").isString().withMessage("User must be a string"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateTransaction,
    validateRebateProgram,
    validateRebateClaim,
    validateRebateClaimsQuery,
    validateTransactionId,
    validateUser
};
