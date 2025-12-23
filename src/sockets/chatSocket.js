const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

module.exports = (io, socket) => {
  /* 🔹 Join chat room */
  socket.on("join-chat", async (chatId) => {
    console.log("Join chat event for chatId:", chatId);
    try {
      if (!chatId) return;

      // ✅ Check user belongs to chat
      const chat = await Chat.findOne({
        _id: chatId,
        users: { $in: [socket.user._id] },
      });

      if (!chat) {
        return socket.emit("error", "Not authorized for this chat");
      }

      socket.join(chatId);
      console.log(
        `🟢 ${socket.user._id.toString()} joined chat ${chatId}`
      );
    } catch (err) {
      console.error("Join chat error:", err);
    }
  });

 

  /* 🔹 Send message */
  socket.on("send-message", async ({ chatId, content }) => {
    console.log('Send message event:', { chatId, content });
    try {
      if (!chatId || !content?.trim()) return;

      // ✅ Authorization check again (important)
      const chat = await Chat.findOne({
        _id: chatId,
        users: { $in: [socket.user._id] },
      });

      if (!chat) return;

      let message = await Message.create({
        sender: socket.user._id,
        content: content.trim(),
        chat: chatId,
      });

      message = await message.populate(
        "sender",
        "firstName lastName photourl"
      );

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      });

      io.to(chatId).emit("receive-message", message);
    } catch (err) {
      console.error("Send message error:", err);
    }
  });
};
