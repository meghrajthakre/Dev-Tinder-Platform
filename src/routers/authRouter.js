const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/userSchema');
const { validate } = require('../utils/validation');
const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  // Validate incoming request data using your custom validate() function
  validate(req)
  try {
    // Extract fields from req.body (sent by the client while signing up)
    const { firstName, lastName, email, password, about, age, photourl, gender ,skills} = req.body;
    // Hash the plain password using bcrypt (10 rounds of salting)
    const passwordHash = await bcrypt.hash(password, 10);
    // Create a new user object with hashed password
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      about,
      age,
      gender,
      skills,
      photourl
    });
    // Save the user document into MongoDB
    await user.save();
    res.status(201).send("SignUp successful");

  } catch (err) {
    console.error("Error saving user:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
})


authRouter.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  try {
    // Check if user exists with given email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).res('Invalid login credentials')
    }

    // Compare entered password with hashed password in DB
    const isPasswordValid = await user.isPassValid(password);

    // If password is valid → generate JWT
    if (isPasswordValid) {

      // Create JWT token with expiry (correct syntax)
      const jwt = await user.getJWT();

      // Send token as cookie to client
      // Cookie expires in 8 hours
      res.cookie("token", jwt, {
        expires: new Date(Date.now() + 8 * 3600000),  // 8 hours
      });

      // Send success response
      return res.status(200).json(user);
    }
    // If password does not match
    else {
      return res.status(401).res('Invalid login credentials')
    }

  } catch (err) {

    // Log the error internally
    console.error("Invalid login credentials:", err.message);

    // Return proper error response
    return res.status(401).json({
      success: false,
      message: "Invalid login credentials: " + err.message
    });
  }
});


authRouter.post('/logout', (req, res) => {
  res.cookie('token', null, {
    expiresIn: new Date(Date.now()),
  })
  res.status(200).json({ message: "Logout Successful" });
})
module.exports = authRouter;