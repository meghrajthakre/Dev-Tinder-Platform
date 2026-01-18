const socketAuth = require("../middlewares/socketAuth");
const chatSocket = require("./chatSocket");
const User = require("../models/userSchema");
module.exports = (io) => {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    console.log("SOCKET USER:", socket.user);

    // Mark online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    console.log("🟢 Socket connected:", userId.toString() );
    socket.join(userId.toString());

    chatSocket(io, socket);

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      console.log("🔴 Socket disconnected:", userId);
    });
  });
};
