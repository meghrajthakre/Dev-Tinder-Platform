const express = require('express');
const profileRouter = express.Router();
const userAuth = require('../middlewares/auth');
const User = require('../models/userSchema');
const { validUserUpdates } = require('../utils/validation');
const isPassValid = require('../models/userSchema');
const bcrypt = require('bcrypt');

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

profileRouter.get('/feed',userAuth, async (req, res) => {
  const users = await User.find({});
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).send("Error fetching users:", error.message);
  }
});

// Update user by ID
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {

  try {
    if (!validUserUpdates(req)) {
      throw new Error("Invalid updates!")
    }
    const loggendInUser = req.user;

    Object.keys(req.body).every((update) => (loggendInUser[update] = req.body[update]));

    await loggendInUser.save();


    // Success response
    res.status(200).json({
      success: true,
      message: `${loggendInUser.firstName} your profile has been updated successfully`,
      user: loggendInUser
    });

  } catch (error) {
    // Error handling
    console.error("User Not Updated:", error.message);
    res.status(500).json({
      success: false,
      message: "User Not Updated",
      error: error.message
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

    user.password =passwordHash;
    await user.save();


    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });


  } catch (error) {
    res.status(500).send(`Error updating password: ${error.message}`);
  }


})

module.exports = profileRouter;