const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/userSchema');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.post('/signup', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send("SignUp successful");
  } catch (err) {
    console.error("Error saving user:", err.message);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

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

app.patch('/update/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Validate MongoDB ObjectId
    if (userId.length !== 24) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser
    });

  } catch (error) {
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