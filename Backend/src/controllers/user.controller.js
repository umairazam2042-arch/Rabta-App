const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { generateOtp, saveOtp, verifyOtp, deleteOtp, getOtpExpiryMinutes } = require("../utils/otp");
const { sendOtpEmail, emailDomainExists } = require("../services/mail.service");

const MIN_AGE = 13;
const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Cookie ki settings
const cookieOptions = {
  httpOnly: true, // JavaScript se cookie nahi parhi ja sakti (XSS se bachao)
  secure: process.env.NODE_ENV === "production", // production mein sirf HTTPS
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 din
};

// Date of birth se umar nikalne ka helper
const calculateAge = (dob) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// Signup ki common checks (OTP bhejne se pehle bhi, aur account banane se pehle bhi)
const validateSignupFields = ({ username, email, dob }) => {
  if ([username, email, dob].some((f) => !f || String(f).trim() === "")) {
    throw new ApiError(400, "username, email and dob are required");
  }

  const cleanUsername = String(username).toLowerCase().trim();
  const cleanEmail = String(email).toLowerCase().trim();

  if (!USERNAME_REGEX.test(cleanUsername)) {
    throw new ApiError(
      400,
      "Username must be 3-30 characters: letters, numbers, underscore and dot only"
    );
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) {
    throw new ApiError(400, "Invalid date of birth. Use format YYYY-MM-DD");
  }
  if (dobDate > new Date()) {
    throw new ApiError(400, "Date of birth cannot be in the future");
  }
  if (calculateAge(dobDate) < MIN_AGE) {
    throw new ApiError(400, `You must be at least ${MIN_AGE} years old to sign up`);
  }

  return { username: cleanUsername, email: cleanEmail, dobDate };
};

// Username ya email pehle se maujood to nahi
const assertUserDoesNotExist = async (username, email) => {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] }).select(
    "username email"
  );

  if (existingUser) {
    throw new ApiError(
      409,
      existingUser.email === email
        ? "An account with this email already exists"
        : "This username is already taken"
    );
  }
};

// POST /api/v1/users/register/send-otp   Body: { username, email, dob }
const sendSignupOtp = asyncHandler(async (req, res) => {
  const { username, email } = validateSignupFields(req.body);

  if (!(await emailDomainExists(email))) {
    throw new ApiError(400, "This email domain cannot receive emails. Please check your email");
  }

  // Pehle hi bata do agar account maujood hai (OTP bhejne ka faida nahi)
  await assertUserDoesNotExist(username, email);

  const otp = generateOtp();
  const expiresInMinutes = getOtpExpiryMinutes();

  // OTP ka hash database mein (collection: otps)
  await saveOtp(email, otp);

  try {
    await sendOtpEmail(email, otp, expiresInMinutes);
  } catch (error) {
    console.error(`OTP email failed: ${error.message}`);
    await deleteOtp(email); // email nahi gayi to record bhi na rahe
    throw new ApiError(502, "Could not send the OTP email. Please check the email and try again");
  }

  // Asal OTP response mein nahi bheja jata
  return res
    .status(200)
    .json(new ApiResponse(200, { email, expiresInMinutes }, "OTP sent to your email"));
});

// POST /api/v1/users/register   Body: { username, email, password, dob, otp }
const registerUser = asyncHandler(async (req, res) => {
  // Dhyan do: role yahan se nahi li ja rahi, is liye signup se admin nahi bana ja sakta
  const { password, otp } = req.body;

  const { username, email, dobDate } = validateSignupFields(req.body);

  if (!password || !otp) {
    throw new ApiError(400, "password and otp are required");
  }

  // 1. OTP check: database wala hash user ke diye OTP se match hona chahiye
  await verifyOtp({ email, otp });

  // 2. Username/email pehle se to nahi
  await assertUserDoesNotExist(username, email);

  // 3. User banao (password model ka pre-save hook khud hash karega)
  const user = await User.create({ username, email, password, dob: dobDate });

  const createdUser = await User.findById(user._id).select("-password");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// POST /api/auth/users/login  (email ya username, dono se login ho sakta hai)
const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "identifier (email or username) and password are required");
  }

  const value = String(identifier).toLowerCase().trim();

  // password ko explicitly mangwana parta hai kyunke model mein select:false hai
  const user = await User.findOne({
    $or: [{ email: value }, { username: value }],
  }).select("+password");

  // Dono galat cases mein same message, taake pata na chale user maujood hai ya nahi
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();

  // Status online kar do
  await User.findByIdAndUpdate(user._id, {
    isLoggedIn: true,
    lastLoginAt: new Date(),
  });

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful"));
});

// POST /api/v1/users/logout
// Body: { "identifier": "ali_khan" }
const logoutUser = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    throw new ApiError(400, "identifier (username or email) is required");
  }

  const value = String(identifier).toLowerCase().trim();

  // Identifier usi account ka hona chahiye jo abhi login hai
  if (value !== req.user.username && value !== req.user.email) {
    throw new ApiError(403, "Identifier does not match the logged-in account");
  }

  // Status offline kar do
  await User.findByIdAndUpdate(req.user._id, {
    isLoggedIn: false,
    lastLogoutAt: new Date(),
  });

  return res
    .status(200)
    .clearCookie("accessToken", { ...cookieOptions, maxAge: undefined })
    .json(new ApiResponse(200, null, `${req.user.username} logged out successfully`));
});

// GET /api/v1/users/me  (apni profile)
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

module.exports = { sendSignupOtp, registerUser, loginUser, logoutUser, getCurrentUser };