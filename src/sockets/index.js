const socketAuth = require('../middlewares/socketAuth');
const chatSocket = require('./chat.socket');

module.exports = (io) => {

  // 🔐 Authenticate BEFORE connection
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.user._id);

    // Join personal room
    socket.join(socket.user._id.toString());

    chatSocket(io, socket);

    socket.on('disconnect', () => {
      console.log("Socket disconnected:", socket.user._id);
    });
  });
};
