const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// 1. Check karta hai ke user login hai ya nahi
const verifyJWT = asyncHandler(async (req, res, next) => {
  // Token cookie se lo, warna Authorization: Bearer <token> header se
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: please login first");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token, please login again");
  }

  // Role token se nahi, database se lo (taake role badle to foran asar ho)
  const user = await User.findById(decoded._id).select("-password");
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

    // Agar user logout ho chuka hai to purana token bhi kaam nahi karega
  if (!user.isLoggedIn) {
    throw new ApiError(401, "You are logged out, please login again");
  }

  req.user = user;
  next();
});

// 2. Check karta hai ke user ka role allowed hai ya nahi
// Use: authorizeRoles("admin")
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: you do not have access to this resource"));
    }
    next();
  };
};

module.exports = { verifyJWT, authorizeRoles };