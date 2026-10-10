const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const isProduction = process.env.NODE_ENV === "production";

const createLimiter = (max, message) =>
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minute
    limit: isProduction ? max : max * 10, // development mein testing ke liye 10 guna chhoot
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res, next) => next(new ApiError(429, message)),
  });

// OTP bhejne par: 10 minute mein 5 baar
const otpSendLimiter = createLimiter(
  5,
  "Too many OTP requests. Please try again after a few minutes"
);

// OTP check karke account banane par: 10 minute mein 10 baar
const registerLimiter = createLimiter(
  10,
  "Too many attempts. Please try again after a few minutes"
);

// Shots mangwane par: 10 minute mein 40 baar (Pexels ki apni hadd bhi hai)
const shotsLimiter = createLimiter(40, "Too many requests for shots. Please slow down");

module.exports = { otpSendLimiter, registerLimiter, shotsLimiter };