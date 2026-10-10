const dns = require("dns").promises;
const nodemailer = require("nodemailer");

let transporter; // ek hi baar banega

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
};

// Email ke domain par mail lene wala server (MX record) hai ya nahi
// (jaise "abc@asdfgh123.xyz" jaisi bekar emails foran pakri jayein)
const emailDomainExists = async (email) => {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    // Domain hi nahi mila = invalid. Koi aur DNS masla ho to user ko rokein nahi
    return !["ENOTFOUND", "ENODATA"].includes(error.code);
  }
};

// OTP wali email bhejta hai
const sendOtpEmail = async (to, otp, expiryMinutes) => {
  const appName = process.env.APP_NAME || "Rabta";

  await getTransporter().sendMail({
    from: `"${appName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your ${appName} verification code`,
    text: `Your ${appName} verification code is ${otp}. It expires in ${expiryMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #e4e7ec;border-radius:12px">
        <h2 style="margin:0 0 8px">${appName}</h2>
        <p style="margin:0 0 16px;color:#475467">Use this code to verify your email address:</p>
        <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;color:#101828">${otp}</p>
        <p style="margin:0;color:#667085;font-size:14px">This code expires in ${expiryMinutes} minutes. If you did not request it, you can ignore this email.</p>
      </div>`,
  });
};

module.exports = { emailDomainExists, sendOtpEmail };