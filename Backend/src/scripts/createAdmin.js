require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user.model");

const createAdmin = async () => {
  try {
    const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DOB, MONGO_URI } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_DOB) {
      throw new Error("ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_DOB must be set in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const existing = await User.findOne({
      $or: [{ email: ADMIN_EMAIL.toLowerCase().trim() }, { username: ADMIN_USERNAME.toLowerCase().trim() }],
    });

    if (existing) {
      // Pehle se maujood user ko admin bana do aur password .env wala kar do
      existing.role = "admin";
      existing.password = ADMIN_PASSWORD; // pre-save hook isay dobara hash karega
      await existing.save();
      console.log(`Existing user updated to admin: ${existing.email}`);
    } else {
      await User.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        dob: new Date(ADMIN_DOB),
        role: "admin",
      });
      console.log(`Admin created successfully: ${ADMIN_EMAIL}`);
    }

    console.log(`Login with identifier: ${ADMIN_EMAIL} (ya username: ${ADMIN_USERNAME})`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();