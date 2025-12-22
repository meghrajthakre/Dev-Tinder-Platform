const Chat = require("../models/chatModel");

exports.accessChat = async (req, res) => {
  const { userId } = req.body; // friend id
  const myId = req.user._id;

  let chat = await Chat.findOne({
    users: { $all: [myId, userId] },
  });

  if (!chat) {
    chat = await Chat.create({
      users: [myId, userId],
    });
  }

  res.json(chat);
};
