const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');

const socketAuth = async (socket, next) => {
  try {
    // 1️⃣ Get token sent from frontend socket
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Please Login!!!"));
    }

    // 2️⃣ Verify token (same secret as HTTP auth)
    const decoded = jwt.verify(token, "meghrajsecret");

    // 3️⃣ Find user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    // 4️⃣ Attach user to socket object
    socket.user = user;

    // 5️⃣ Allow socket connection
    next();

  } catch (error) {
    next(new Error("Unauthorized Access"));
  }
};

module.exports = socketAuth;
