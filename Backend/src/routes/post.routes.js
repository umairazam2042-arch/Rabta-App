const express = require("express");
const {
  createPost,
  getAllPosts,
  getMyPosts,
  getUserPosts,
  getPostById,
  getPostLikes,
  likePost,
  unlikePost,
  deletePost,
} = require("../controllers/post.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Posts ke sab routes ke liye login zaroori hai
router.use(verifyJWT);

router.post("/", upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/my", getMyPosts);
router.get("/user/:username", getUserPosts); // "/:id/likes" se pehle likhna zaroori hai
router.get("/:id", getPostById);
router.get("/:id/likes", getPostLikes);
router.post("/:id/like", likePost);
router.delete("/:id/like", unlikePost);
router.delete("/:id", deletePost);

module.exports = router;