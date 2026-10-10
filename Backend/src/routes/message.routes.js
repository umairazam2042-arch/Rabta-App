const express = require("express");
const {
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
} = require("../controllers/message.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

// Messages ke sab routes ke liye login zaroori hai
router.use(verifyJWT);

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.put("/keys", setPublicKey);

router.get("/with/:username", getMessages);
router.post("/with/:username", sendMessage);
router.patch("/with/:username/read", markAsRead);
router.get("/with/:username/auto-delete", getAutoDelete);
router.put("/with/:username/auto-delete", setAutoDelete);

router.patch("/item/:id", editMessage);
router.delete("/item/:id", deleteMessage);

module.exports = router;