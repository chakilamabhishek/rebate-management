const { Router } = require("express");
const TransactionController = require("../controllers/transactionController");
const jwtValidator = require("../middlewares/jwtValidator");
const { validateTransaction } = require("../middlewares/validationMiddleware");

const router = Router();

router.post("/", jwtValidator, validateTransaction, TransactionController.submitTransaction);

module.exports = router;