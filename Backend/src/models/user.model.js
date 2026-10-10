const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must be at most 30 characters"],
      match: [
        /^[a-z0-9_.]+$/,
        "Username can only contain letters, numbers, underscore and dot",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // query mein password by default nahi aayega
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    // Role: sirf "user" ya "admin". Default hamesha "user" hai
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Profile picture (ImageKit par)
    avatar: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },
    // Login/logout status
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
        // E2EE: browser ki public key (base64). Private key kabhi server par nahi aati.
    publicKey: {
      type: String,
      default: "",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLogoutAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Save hone se pehle password hash karo (sirf tab jab password badla ho)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Login ke waqt password compare karne ke liye
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Login ke baad JWT token banata hai (is mein user ki id aur role hoti hai)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    
  );
};

module.exports = mongoose.model("User", userSchema);