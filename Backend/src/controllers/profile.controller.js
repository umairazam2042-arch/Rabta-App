const User = require("../models/user.model");
const Post = require("../models/post.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadImage, deleteImage } = require("../services/imagekit.service");

// GET /api/v1/profile/:username
const getProfile = asyncHandler(async (req, res) => {
  const username = String(req.params.username).toLowerCase().trim();

  // Sirf wo cheezein jo doosre users ko dikhana theek hai (email, dob, role nahi)
  const user = await User.findOne({ username }).select("username avatar.url createdAt");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const postsCount = await Post.countDocuments({ author: user._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
        postsCount,
      },
      "Profile fetched"
    )
  );
});

// PATCH /api/v1/profile/avatar   (form-data: avatar (file))
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please choose an image");
  }

  // 1. Nayi image ImageKit par
  const uploaded = await uploadImage(req.file, "/avatars");

  // 2. Database mein save karo
  const oldFileId = req.user.avatar?.fileId;
  let user;
  try {
    user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploaded },
      { new: true }
    ).select("-password");
  } catch (error) {
    await deleteImage(uploaded.fileId); // save fail hua to nayi image bhi hata do
    throw error;
  }

  // 3. Purani tasveer hatao (ye fail ho to bhi request kamyab rahe)
  if (oldFileId) {
    try {
      await deleteImage(oldFileId);
    } catch (error) {
      console.error(`Old avatar delete failed: ${error.message}`);
    }
  }

  return res.status(200).json(new ApiResponse(200, user, "Profile picture updated"));
});

module.exports = { getProfile, updateAvatar };