const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");

const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 5 * 60 * 1000; // har 5 minute check karo

// Jin users ka auto-delete time aa gaya, un ke liye chat saaf karo
const runAutoDelete = async () => {
  const now = new Date();

  const chats = await Conversation.find({
    autoDelete: { $elemMatch: { enabled: true, nextRunAt: { $lte: now } } },
  });

  for (const chat of chats) {
    for (const setting of chat.autoDelete) {
      if (!setting.enabled || setting.nextRunAt > now) continue;

      // Sirf is user ke liye messages chupa do (doosre user ki screen par rahenge)
      await Message.updateMany(
        { conversation: chat._id },
        { $addToSet: { deletedFor: setting.user } }
      );

      // Agla run 24 ghante baad
      await Conversation.updateOne(
        { _id: chat._id, "autoDelete.user": setting.user },
        { $set: { "autoDelete.$.nextRunAt": new Date(now.getTime() + DAY_MS) } }
      );
    }
  }
};

const startAutoDeleteJob = () => {
  setInterval(() => {
    runAutoDelete().catch((err) => console.error(`Auto-delete failed: ${err.message}`));
  }, CHECK_EVERY_MS);
};

module.exports = { startAutoDeleteJob };