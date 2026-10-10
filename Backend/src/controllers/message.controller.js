const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const USER_FIELDS = "username avatar.url publicKey";
const MAX_LENGTH = 12000;
// AES-GCM ka IV (12 byte) base64 mein 16 characters
const IV_REGEX = /^[A-Za-z0-9+/]{16}$/;
// P-256 public key base64 mein 88 characters
const PUBLIC_KEY_REGEX = /^[A-Za-z0-9+/]{87}=$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const toPlain = (data) => JSON.parse(JSON.stringify(data));
const getPairKey = (idA, idB) => [idA.toString(), idB.toString()].sort().join("_");

// Socket se ek ya zyada users ko event bhejo
const emitTo = (req, ids, event, data) => {
  const io = req.app.get("io");
  if (!io) return;
  ids.forEach((id) => io.to(`user:${id}`).emit(event, data));
};

const findOtherUser = async (username, me) => {
  const other = await User.findOne({
    username: String(username).toLowerCase().trim(),
  }).select(USER_FIELDS);

  if (!other) throw new ApiError(404, "User not found");
  if (other._id.equals(me._id)) throw new ApiError(400, "You cannot message yourself");
  return other;
};

const findConversation = (meId, other) =>
  Conversation.findOne({ participantsKey: getPairKey(meId, other._id) }).select("_id autoDelete");

const getOrCreateConversation = (me, other) =>
  Conversation.findOneAndUpdate(
    { participantsKey: getPairKey(me, other._id) },
    { $setOnInsert: { participants: [me, other._id] } },
    { upsert: true, new: true }
  );

// GET /api/v1/messages/conversations
const getConversations = asyncHandler(async (req, res) => {
  const me = req.user._id;

  const conversations = await Conversation.find({ participants: me })
    .sort({ "lastMessage.createdAt": -1 })
    .limit(50)
    .populate("participants", USER_FIELDS);

  const unread = await Message.aggregate([
    {
      $match: {
        receiver: me,
        readAt: null,
        deletedFor: { $ne: me },
        deletedForEveryone: false,
      },
    },
    { $group: { _id: "$conversation", count: { $sum: 1 } } },
  ]);
  const unreadMap = new Map(unread.map((u) => [u._id.toString(), u.count]));

  const list = conversations
    .map((c) => {
      const other = c.participants.find((p) => !p._id.equals(me));
      if (!other) return null;
      return {
        _id: c._id,
        user: other,
        lastMessage: c.lastMessage,
        unreadCount: unreadMap.get(c._id.toString()) || 0,
      };
    })
    .filter(Boolean);

  return res.status(200).json(new ApiResponse(200, toPlain(list), "Conversations fetched"));
});

// GET /api/v1/messages/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    readAt: null,
    deletedFor: { $ne: req.user._id },
    deletedForEveryone: false,
  });
  return res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched"));
});

// GET /api/v1/messages/with/:username?before=<ISO date>&limit=30
const getMessages = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const other = await findOtherUser(req.params.username, req.user);
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);

  const conversation = await findConversation(me, other);
  if (!conversation) {
    return res
      .status(200)
      .json(new ApiResponse(200, toPlain({ user: other, messages: [], hasMore: false }), "Messages fetched"));
  }

  // Jo message is user ne "sirf mere liye" hata diya, wo nahi aayega
  const filter = { conversation: conversation._id, deletedFor: { $ne: me } };
  if (req.query.before) {
    const before = new Date(req.query.before);
    if (!isNaN(before.getTime())) filter.createdAt = { $lt: before };
  }

  const found = await Message.find(filter).sort({ createdAt: -1 }).limit(limit + 1);
  const hasMore = found.length > limit;
  const messages = found.slice(0, limit).reverse();

  return res
    .status(200)
    .json(new ApiResponse(200, toPlain({ user: other, messages, hasMore }), "Messages fetched"));
});

// POST /api/v1/messages/with/:username   Body: { text, iv }
const sendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text ?? "").trim();
  const iv = String(req.body.iv ?? "").trim();

  if (!text) throw new ApiError(400, "Message cannot be empty");
  if (text.length > MAX_LENGTH) throw new ApiError(400, "Message is too long");
  if (!IV_REGEX.test(iv)) throw new ApiError(400, "Message must be end-to-end encrypted");

  const me = req.user._id;
  const other = await findOtherUser(req.params.username, req.user);
  const conversation = await getOrCreateConversation(me, other);

  const message = await Message.create({
    conversation: conversation._id,
    sender: me,
    receiver: other._id,
    text,
    iv,
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    { lastMessage: { text, iv, sender: me, createdAt: message.createdAt } }
  );

  const payload = toPlain({
    message,
    sender: {
      _id: me,
      username: req.user.username,
      avatar: { url: req.user.avatar?.url || "" },
      publicKey: req.user.publicKey || "",
    },
    receiver: {
      _id: other._id,
      username: other.username,
      avatar: { url: other.avatar?.url || "" },
      publicKey: other.publicKey || "",
    },
  });
  emitTo(req, [me, other._id], "message:new", payload);

  return res.status(201).json(new ApiResponse(201, toPlain(message), "Message sent"));
});

// PATCH /api/v1/messages/item/:id   Body: { text, iv }  (sirf sender edit kar sakta hai)
const editMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text ?? "").trim();
  const iv = String(req.body.iv ?? "").trim();

  if (!text) throw new ApiError(400, "Message cannot be empty");
  if (!IV_REGEX.test(iv)) throw new ApiError(400, "Message must be end-to-end encrypted");

  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, "Message not found");
  if (!message.sender.equals(req.user._id)) {
    throw new ApiError(403, "You can edit only your own messages");
  }
  if (message.deletedForEveryone) throw new ApiError(400, "This message was deleted");

  message.text = text;
  message.iv = iv;
  message.editedAt = new Date();
  await message.save();

  // Agar ye aakhri message tha to chat list ka preview bhi badlo
  await Conversation.updateOne(
    { _id: message.conversation, "lastMessage.createdAt": message.createdAt },
    { "lastMessage.text": text, "lastMessage.iv": iv }
  );

  emitTo(req, [message.sender, message.receiver], "message:updated", toPlain({ message }));

  return res.status(200).json(new ApiResponse(200, toPlain(message), "Message edited"));
});

// DELETE /api/v1/messages/item/:id?scope=me|everyone
const deleteMessage = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const scope = req.query.scope === "everyone" ? "everyone" : "me";

  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, "Message not found");

  const isParticipant = message.sender.equals(me) || message.receiver.equals(me);
  if (!isParticipant) throw new ApiError(403, "Not allowed");

  if (scope === "everyone") {
    if (!message.sender.equals(me)) {
      throw new ApiError(403, "Only the sender can delete for everyone");
    }

    message.deletedForEveryone = true;
    message.text = "";
    message.iv = "";
    await message.save();

    await Conversation.updateOne(
      { _id: message.conversation, "lastMessage.createdAt": message.createdAt },
      { "lastMessage.text": "Ye message delete ho gaya", "lastMessage.iv": "" }
    );

    emitTo(req, [message.sender, message.receiver], "message:updated", toPlain({ message }));
  } else {
    await Message.updateOne({ _id: message._id }, { $addToSet: { deletedFor: me } });
  }

  return res.status(200).json(new ApiResponse(200, { _id: message._id, scope }, "Message deleted"));
});

// PATCH /api/v1/messages/with/:username/read
const markAsRead = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const other = await findOtherUser(req.params.username, req.user);

  let updated = 0;
  const conversation = await findConversation(me, other);

  if (conversation) {
    const readAt = new Date();
    const result = await Message.updateMany(
      { conversation: conversation._id, receiver: me, readAt: null },
      { readAt }
    );
    updated = result.modifiedCount;

    if (updated > 0) {
      emitTo(req, [other._id], "messages:read", { by: me.toString(), readAt: readAt.toISOString() });
      emitTo(req, [me], "unread:update", {});
    }
  }

  return res.status(200).json(new ApiResponse(200, { updated }, "Messages marked as read"));
});

// PUT /api/v1/messages/keys   Body: { publicKey }
const setPublicKey = asyncHandler(async (req, res) => {
  const publicKey = String(req.body.publicKey ?? "").trim();
  if (!PUBLIC_KEY_REGEX.test(publicKey)) throw new ApiError(400, "Invalid public key");

  await User.findByIdAndUpdate(req.user._id, { publicKey });
  return res.status(200).json(new ApiResponse(200, { publicKey }, "Public key saved"));
});

// GET /api/v1/messages/with/:username/auto-delete
const getAutoDelete = asyncHandler(async (req, res) => {
  const other = await findOtherUser(req.params.username, req.user);
  const conversation = await findConversation(req.user._id, other);

  const mine = conversation?.autoDelete?.find((s) => s.user.equals(req.user._id));
  return res.status(200).json(
    new ApiResponse(
      200,
      { enabled: Boolean(mine?.enabled), nextRunAt: mine?.nextRunAt || null },
      "Auto-delete status fetched"
    )
  );
});

// PUT /api/v1/messages/with/:username/auto-delete   Body: { enabled }
const setAutoDelete = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const enabled = Boolean(req.body.enabled);
  const other = await findOtherUser(req.params.username, req.user);
  const conversation = await getOrCreateConversation(me, other);

  // Purani setting hatao, phir agar on hai to nayi lagao
  await Conversation.updateOne({ _id: conversation._id }, { $pull: { autoDelete: { user: me } } });

  let nextRunAt = null;
  if (enabled) {
    nextRunAt = new Date(Date.now() + DAY_MS);
    await Conversation.updateOne(
      { _id: conversation._id },
      { $push: { autoDelete: { user: me, enabled: true, nextRunAt } } }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { enabled, nextRunAt }, "Auto-delete updated"));
});

module.exports = {
  getConversations,
  getUnreadCount,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  setPublicKey,
  getAutoDelete,
  setAutoDelete,
};