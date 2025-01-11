const { Router } = require("express");
const jwt = require("jsonwebtoken");
const config = require('../config');
const { validateUser } = require("../middlewares/validationMiddleware");
const { StatusCodes } = require("http-status-codes");

const router = Router();

router.post("/token", validateUser, (req, res) => {
    const { user } = req.body;
    if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "User information is required" });
    }

    const token = jwt.sign({ user }, config.jwtSecret, { expiresIn: "30m" });
    res.json({ token });
});

module.exports = router;
