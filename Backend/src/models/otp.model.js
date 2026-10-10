const mongoose = require("mongoose");

// Signup OTP ka record. Har email ka sirf ek record rehta hai.
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["signup"],
      default: "signup",
    },
    // OTP ka HMAC hash (asal ank nahi)
    otp: {
      type: String,
      required: true,
    },
    // Galat koshishon ki ginti
    attempts: {
      type: Number,
      default: 0,
    },
    // Is waqt ke baad MongoDB record khud delete kar deta hai
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Ek email + purpose ka ek hi record
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });


module.exports = mongoose.model("Otp", otpSchema);