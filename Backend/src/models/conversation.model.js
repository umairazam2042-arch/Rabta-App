const mongoose = require("mongoose");

// Auto-delete ki setting har user ki alag hoti hai
const autoDeleteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    enabled: { type: Boolean, default: true },
    nextRunAt: { type: Date, required: true },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    // Dono ids sort karke jori hui: ek jode ki sirf ek conversation
    participantsKey: { type: String, required: true, unique: true },
    // Chat list ke liye aakhri message
    lastMessage: {
      text: { type: String },
      iv: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
    autoDelete: [autoDeleteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);