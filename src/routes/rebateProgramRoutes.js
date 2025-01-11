const { Router } = require("express");
const RebateProgramController = require("../controllers/rebateProgramController");
const jwtValidator = require("../middlewares/jwtValidator");
const { validateRebateProgram } = require("../middlewares/validationMiddleware");

const router = Router();

router.post("/", jwtValidator, validateRebateProgram, RebateProgramController.createRebateProgram);

module.exports = router;