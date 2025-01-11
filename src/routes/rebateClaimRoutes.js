const { Router } = require("express");
const RebateClaimController = require("../controllers/rebateClaimController");
const jwtValidator = require("../middlewares/jwtValidator");
const { validateRebateClaim, validateRebateClaimsQuery, validateTransactionId } = require("../middlewares/validationMiddleware");

const router = Router();

router.post("/", jwtValidator, validateRebateClaim, RebateClaimController.claimRebate);
router.get("/", jwtValidator, validateRebateClaimsQuery, RebateClaimController.getRebateClaims);
router.get("/calculate/:transactionId", jwtValidator, validateTransactionId, RebateClaimController.calculateRebate);

module.exports = router;