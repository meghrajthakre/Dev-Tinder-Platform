const express = require('express');
const connectDB = require('./config/database');
const app = express();
const port = process.env.PORT || 3001;
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter');
const profileRouter = require('./routers/profileRouter');
const requestRouter = require('./routers/requestRouter');
const userRouter = require('./routers/user');
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routing 
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter)


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