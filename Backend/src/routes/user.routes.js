const express = require("express");
const {
  sendSignupOtp,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { otpSendLimiter, registerLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Public routes (login ki zaroorat nahi)
router.post("/register/send-otp", otpSendLimiter, sendSignupOtp);
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginUser);

// Protected routes (login zaroori hai)
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);

module.exports = router;