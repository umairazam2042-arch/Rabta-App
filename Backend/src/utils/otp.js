const crypto = require("crypto");
const Otp = require("../models/otp.model");
const ApiError = require("./ApiError");

const MAX_ATTEMPTS = 5;

const getOtpExpiryMinutes = () => Number(process.env.OTP_EXPIRY_MINUTES) || 5;

// 6 ank ka random OTP (crypto asli random hai, Math.random jaisa andaza lagane wala nahi)
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// OTP database mein save karta hai. Purana record ho to usi ko naye OTP se badal deta hai.
const saveOtp = async (email, otp) => {
  const expiresAt = new Date(Date.now() + getOtpExpiryMinutes() * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email, purpose: "signup" },
    { otp, attempts: 0, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// OTP record hata do (jaise email nahi ja saki)
const deleteOtp = async (email) => {
  await Otp.deleteOne({ email, purpose: "signup" });
};

// Database wale OTP ko user ke diye OTP se match karta hai.
// Sahi ho to record delete ho jata hai (OTP sirf ek baar kaam aata hai).
// Galat ya expired ho to record database mein hi rehta hai.
const verifyOtp = async ({ email, otp }) => {
  const record = await Otp.findOne({ email, purpose: "signup" });

  if (!record || record.expiresAt <= new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new ApiError(429, "Too many wrong attempts. Please request a new OTP");
  }

  const expected = Buffer.from(String(record.otp));
  const actual = Buffer.from(String(otp).trim());

  // timingSafeEqual: compare karne ke waqt se OTP ka andaza lagana mushkil ho jata hai
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    throw new ApiError(400, "Incorrect OTP");
  }

  // Sahi OTP: ab hata do. Do baar submit ho jaye to doosri baar fail hoga.
  const used = await Otp.findOneAndDelete({ _id: record._id });
  if (!used) {
    throw new ApiError(400, "OTP has already been used. Please request a new one");
  }
};

module.exports = { generateOtp, saveOtp, verifyOtp, deleteOtp, getOtpExpiryMinutes };