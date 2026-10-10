const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Encrypted text (ciphertext). Server asal message nahi dekh sakta.
    text: { type: String, default: "", maxlength: 12000 },
    // Encryption ka IV (base64)
    iv: { type: String, default: "" },

    // Jin users ne "Sirf mere liye" delete kiya (ya auto-delete ne hata diya)
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Sender ne "Sab ke liye" delete kiya
    deletedForEveryone: { type: Boolean, default: false },

    editedAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, readAt: 1 });

module.exports = mongoose.model("Message", messageSchema);