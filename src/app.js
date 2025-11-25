const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/userSchema');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const validate = require('./utils/validation');
const cookieParser = require('cookie-parser');
const jsonewebtoken = require('jsonwebtoken');
const userAuth = require('./middlewares/auth');
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/signup', async (req, res) => {
  validate(req)
  try {
    //extract from req.body
    const { firstName, lastName, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash
    });
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

app.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  try {
    // Check if user exists with given email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid login credentials");
    }

    // Compare entered password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password is valid → generate JWT
    if (isPasswordValid) {

      // Create JWT token with expiry (correct syntax)
      const jwt = await jsonewebtoken.sign(
        { id: user._id },           // data to encode
        "meghrajsecret",            // secret key
        { expiresIn: "1d" }         // token expiry → 1 day
      );

      // Send token as cookie to client
      // Cookie expires in 8 hours
      res.cookie("token", jwt, {
        expires: new Date(Date.now() + 8 * 3600000),  // 8 hours
      });

      // Send success response
      return res.status(200).json({
        message: "Login successful!!!"
      });
    }
    // If password does not match
    else {
      throw new Error("Invalid login credentials");
    }

  } catch (err) {

    // Log the error internally
    console.error("Error logging in user:", err.message);

    // Return proper error response
    return res.status(500).json({
      success: false,
      message: "Server error: " + err.message
    });
  }
});


app.get('/profile', userAuth, async (req, res) => {


  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(`ERROR fetching profile: ${error.message}`);
  }
})


app.get('/user', async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length === 0) {
      return res.status(404).send("User not found");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error("Error saving user:", err.message);
    res.status(500).send("Internal Server Error");
  }
})


app.get('/feed', async (req, res) => {
  const users = await User.find({});
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Error fetching users:", err.message);
  }
});

app.delete('/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    if (userId.length !== 24) {
      return res.status(400).send("Invalid User ID");
    }
    await User.findByIdAndDelete(userId);
    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error("Error Deleting users:", err.message);
    res.status(404).send("Error Deleting users:", err.message);
  }
})

// Update user by ID
app.patch('/update/:id', async (req, res) => {
  const userId = req.params.id;       // Get user ID from URL params
  const data = req.body;              // Get update data from request body

  try {
    // Allowed fields that can be updated
    const ALLOWED_UPDATES = ['firstName', 'lastName', 'password', 'gender', 'age', 'photourl', 'skills'];

    // Check if every incoming update field is allowed
    const requestUpdates = Object.keys(data).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );

    // If user tries to update a field not allowed → throw error
    if (!requestUpdates) {
      throw new Error(' updates! not allowed ');
    }

    // Validate skills array length (max 50 items)
    if (data.skills && data.skills.length > 50) {
      throw new Error(' skills exceeded the limit of 50 ');
    }

    // Validate MongoDB ObjectId (must be 24 characters)
    if (userId.length !== 24) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Update user in DB with validation enabled
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      data,
      { new: true, runValidators: true } // new: return updated doc, runValidators: apply schema validation
    );

    // If user ID not found in DB
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
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


connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    })
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });


// meghrajthakre444_db_user
// MeghrajThakre@1234