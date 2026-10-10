const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Sirf shot ka link (video ki file nahi)
    reel: {
      source: { type: String },
      externalId: { type: String, required: true },
      videoUrl: { type: String, required: true },
      posterUrl: { type: String },
      pageUrl: { type: String },
      duration: { type: Number },
      credit: { name: { type: String }, url: { type: String } },
    },
    // Is waqt ke baad status khatam
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: expiresAt guzarte hi MongoDB khud document hata deta hai
// (MongoDB har ~1 minute mein check karta hai, is liye hatne mein thori der lag sakti hai)
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Status", statusSchema);