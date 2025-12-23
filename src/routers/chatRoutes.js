const express = require("express");
const chatRouter = express.Router();
const Chat = require("../models/chatModel");
const User = require("../models/userSchema");
const userAuth = require("../middlewares/auth"); // JWT middleware

// Access or create chat
chatRouter.post("/chat/access/:userId", userAuth, async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  
  try {
    if (myId.toString() === userId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    let chat = await Chat.findOne({
      users: { $all: [myId, userId] },
    })
      .populate("users", "firstName lastName photourl email")
      .populate("latestMessage");

    if (!chat) {
      chat = await Chat.create({
        users: [myId, userId],
      });

      chat = await chat.populate(
        "users",
        "firstName lastName photourl email"
      );
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Chat access error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = chatRouter;
