const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/v1/admin/users
// GET /api/v1/admin/users            -> sab users
// GET /api/v1/admin/users?status=online   -> sirf login wale
// GET /api/v1/admin/users?status=offline  -> sirf logout wale

const getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === "online") filter.isLoggedIn = true;
  if (req.query.status === "offline") filter.isLoggedIn = false;

  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { count: users.length, users }, "Users fetched"));
});


// DELETE /api/v1/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Admin kisi doosray admin ko ya khud ko delete na kar sake
  if (user.role === "admin") {
    throw new ApiError(403, "Admin accounts cannot be deleted from here");
  }

  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// GET /api/v1/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user, "User fetched"));
});

// GET /api/v1/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [total, online] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isLoggedIn: true }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { total, online, offline: total - online }, "Stats fetched"));
});

module.exports = { getAllUsers, getUserById, getStats, deleteUser };