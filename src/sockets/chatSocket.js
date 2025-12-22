const Message = require("../models/messageModel");

module.exports = (io, socket) => {

  // 🔹 Join room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log("Joined room:", chatId);
  });

  // 🔹 Send message
  socket.on("sendMessage", async ({ chatId, text }) => {
    const message = await Message.create({
      chat: chatId,
      sender: socket.user._id,
      text,
    });

    io.to(chatId).emit("receiveMessage", {
      _id: message._id,
      text: message.text,
      sender: socket.user._id,
      chatId,
      time: message.createdAt,
    });
  });
};
