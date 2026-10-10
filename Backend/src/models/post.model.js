const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Post kis user ki hai (User collection se link)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [2200, "Caption must be at most 2200 characters"],
      default: "",
    },
    // ImageKit wali image ka URL aur fileId
    image: {
      url: { type: String },
      fileId: { type: String },
    },
        // Un users ki ids jinhon ne is post ko like kiya
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);