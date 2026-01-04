const express = require('express');
const profileRouter = express.Router();
const userAuth = require('../middlewares/auth');
const User = require('../models/userSchema');
const { validUserUpdates } = require('../utils/validation');
const isPassValid = require('../models/userSchema');
const bcrypt = require('bcrypt');
const ConnectionRequest = require("../models/connectionRequest");
const Chat = require("../models/chatModel");


profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(`ERROR fetching profile: ${error.message}`);
  }
})

profileRouter.get('/feed', userAuth, async (req, res) => {
  const users = await User.find({});
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).send("Error fetching users:", error.message);
  }
});

// Update user by ID
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validUserUpdates(req)) {
      return res.status(400).json({ success: false, message: "Invalid fields" });
    }

    const user = req.user;
    Object.keys(req.body).forEach(
      (key) => (user[key] = req.body[key])
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


profileRouter.patch("/profile/forgotPassword", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      throw new Error("Both current and new passwords are required");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const isPassValid = await user.isPassValid(password);

    if (!isPassValid) {
      throw new Error("Invalid current password");
    }

    user.password = passwordHash;
    await user.save();


    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });


  } catch (error) {
    res.status(500).send(`Error updating password: ${error.message}`);
  }


})

profileRouter.get('/profile/:id', userAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).send(`ERROR fetching user: ${error.message}`);
  }
}
);

profileRouter.delete(
  "/connection/remove/:id",
  userAuth,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const userIdToRemove = req.params.id;

      const connection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: userId, toUserId: userIdToRemove },
          { fromUserId: userIdToRemove, toUserId: userId },
        ],
      });

      if (!connection) {
        return res.status(404).json({
          success: false,
          message: "Connection does not exist",
        });
      }

      await ConnectionRequest.deleteOne({ _id: connection._id });

      await Chat.findOneAndDelete({
        users: { $all: [userId, userIdToRemove] },
      });

      return res.status(200).json({
        success: true,
        message: "Connection removed successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error removing connection",
        error: error.message,
      });
    }
  }
);


module.exports = profileRouter;