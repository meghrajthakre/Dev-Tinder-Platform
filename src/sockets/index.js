const socketAuth = require("../middlewares/socketAuth");
const chatSocket = require("./chatSocket");

module.exports = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.user._id.toString());

    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.user._id.toString());
    });
  });
};
