const Status = require("../models/status.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeReel } = require("../utils/reel");

// Status kitni der rahe (ghante): .env ke STATUS_TTL_HOURS se, warna 24
const getTtlMs = () => (Number(process.env.STATUS_TTL_HOURS) || 24) * 60 * 60 * 1000;

// POST /api/v1/statuses   Body: { reel }   (ek click par status)
const createStatus = asyncHandler(async (req, res) => {
  const reel = sanitizeReel(req.body.reel);
  const now = new Date();

  // Wahi shot pehle se mere status mein ho to dobara nahi lagani
  const existing = await Status.findOne({
    user: req.user._id,
    "reel.externalId": reel.externalId,
    expiresAt: { $gt: now },
  });
  if (existing) {
    return res.status(200).json(new ApiResponse(200, existing, "Already in your status"));
  }

  const status = await Status.create({
    user: req.user._id,
    reel,
    expiresAt: new Date(now.getTime() + getTtlMs()),
  });

  return res.status(201).json(new ApiResponse(201, status, "Added to your status"));
});

// GET /api/v1/statuses   (abhi chalne wale sab statuses, user ke hisab se guruh mein)
const getStatuses = asyncHandler(async (req, res) => {
  // expiresAt wali shart ki wajah se expire hua status foran chhup jata hai,
  // chahe MongoDB ne use abhi delete na kiya ho
  const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
    .sort({ createdAt: 1 })
    .limit(300)
    .populate("user", "username avatar.url");

  const groups = new Map();
  for (const s of statuses) {
    if (!s.user) continue; // account delete ho chuka ho

    const key = s.user._id.toString();
    if (!groups.has(key)) {
      groups.set(key, {
        user: s.user,
        isMine: s.user._id.equals(req.user._id),
        statuses: [],
      });
    }
    groups.get(key).statuses.push({
      _id: s._id,
      reel: s.reel,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    });
  }

  // Mera status pehle, phir jis ka status sab se taaza ho
  const list = [...groups.values()].sort((a, b) => {
    if (a.isMine !== b.isMine) return a.isMine ? -1 : 1;
    return b.statuses.at(-1).createdAt - a.statuses.at(-1).createdAt;
  });

  return res.status(200).json(new ApiResponse(200, list, "Statuses fetched"));
});

// DELETE /api/v1/statuses/:id   (sirf malik ya admin, 24 ghante se pehle hatana ho to)
const deleteStatus = asyncHandler(async (req, res) => {
  const status = await Status.findById(req.params.id);
  if (!status) {
    throw new ApiError(404, "Status not found");
  }

  const isOwner = status.user.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "You can only delete your own status");
  }

  await status.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "Status deleted"));
});

module.exports = { createStatus, getStatuses, deleteStatus };