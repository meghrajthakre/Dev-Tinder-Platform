const express = require('express');
const connectDB = require('./config/database');


const app = express();
const port = process.env.PORT || 3000;


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