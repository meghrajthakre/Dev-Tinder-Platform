const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const userAuth = require("../middlewares/auth");

const messageRouter = express.Router();

/**
 * GET /api/message/:chatId
 * Fetch all messages of a chat (only if user is part of that chat)
 */
messageRouter.get("/message/:chatId", userAuth, async (req, res) => {
  console.log('chat router is acces')
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // ✅ Validate chatId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chat id" });
    }

    // ✅ Check user belongs to this chat
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $in: [userId] },
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Fetch messages
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName photourl")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = messageRouter;
