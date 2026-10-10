const express = require("express");
const { getShots } = require("../controllers/shot.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { shotsLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

router.use(verifyJWT);

router.get("/", shotsLimiter, getShots);

module.exports = router;