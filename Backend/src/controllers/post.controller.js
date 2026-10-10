const Post = require("../models/post.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const formatPost = require("../utils/formatPost");
const { uploadImage, deleteImage } = require("../services/imagekit.service");

// Post ke author ki kaun si fields bhejni hain (fileId nahi)
const AUTHOR_FIELDS = "username avatar.url";

// POST /api/v1/posts   (form-data: image (file), caption (text))
const createPost = asyncHandler(async (req, res) => {
  const caption = (req.body.caption || "").trim();

  // Kam az kam caption ya image mein se ek zaroor ho
  if (!caption && !req.file) {
    throw new ApiError(400, "Post must have a caption or an image");
  }

  // 1. Image hai to ImageKit par upload karo
  let image;
  if (req.file) {
    image = await uploadImage(req.file);
  }

  // 2. Post database mein save karo (author = login user)
  let post;
  try {
    post = await Post.create({ author: req.user._id, caption, image });
  } catch (error) {
    // DB mein save fail ho jaye to ImageKit par faltu image na rahe
    if (image) await deleteImage(image.fileId);
    throw error;
  }

  return res
    .status(201)
    .json(new ApiResponse(201, formatPost(post, req.user._id), "Post created successfully"));
});

// GET /api/v1/posts?page=1&limit=10   (sab ki posts, nayi pehle)
const getAllPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS),
    Post.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: posts.map((p) => formatPost(p, req.user._id)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      "Posts fetched"
    )
  );
});

// GET /api/v1/posts/my   (sirf apni posts)
const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate("author", AUTHOR_FIELDS);

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: posts.length, posts: posts.map((p) => formatPost(p, req.user._id)) },
      "Your posts fetched"
    )
  );
});

// GET /api/v1/posts/user/:username?page=1&limit=10   (kisi ek user ki posts)
const getUserPosts = asyncHandler(async (req, res) => {
  const username = String(req.params.username).toLowerCase().trim();

  const author = await User.findOne({ username }).select("_id");
  if (!author) {
    throw new ApiError(404, "User not found");
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const filter = { author: author._id };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: posts.map((p) => formatPost(p, req.user._id)),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      "User posts fetched"
    )
  );
});

// GET /api/v1/posts/:id
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatPost(post, req.user._id), "Post fetched"));
});

// GET /api/v1/posts/:id/likes   (kin users ne like kiya, max 50)
const getPostLikes = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .select("likes")
    .populate({ path: "likes", select: "username avatar.url", options: { limit: 50 } });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200).json(new ApiResponse(200, { users: post.likes }, "Likes fetched"));
});

// POST /api/v1/posts/:id/like
const likePost = asyncHandler(async (req, res) => {
  // $addToSet: user pehle se like kar chuka ho to dobara add nahi hota
  // timestamps: false -> like se post ka updatedAt na badle
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true, timestamps: false }
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true, likesCount: post.likes.length }, "Post liked"));
});

// DELETE /api/v1/posts/:id/like
const unlikePost = asyncHandler(async (req, res) => {
  // $pull: user ki id likes se hata deta hai (like na ho to kuch nahi hota)
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true, timestamps: false }
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: false, likesCount: post.likes.length }, "Post unliked"));
});

// DELETE /api/v1/posts/:id   (sirf post ka malik ya admin)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  // Pehle ImageKit se image hatao, phir database se post
  if (post.image?.fileId) {
    await deleteImage(post.image.fileId);
  }
  await post.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  getUserPosts,
  getPostById,
  getPostLikes,
  likePost,
  unlikePost,
  deletePost,
};