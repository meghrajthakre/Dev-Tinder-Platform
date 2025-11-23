const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/userSchema');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.post('/signup', async(req, res) => {
   const user = new User({
    firstName: "Meghraj",
    lastName: "Thakre",
    email: "meghrajthakre@123",
    password: "Meghraj@1234",
    gender: "Male",
   })

    await user.save();

    res.send("signUp successful");
})



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