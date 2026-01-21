require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRouter = require('./routers/authRouter');
const profileRouter = require('./routers/profileRouter');
const messageRouter = require('./routers/messageRoutes');
const requestRouter = require('./routers/requestRouter');
const userRouter = require('./routers/user');
const initSocket = require('./sockets');
const chatRouter = require('./routers/chatRoutes');
const paymentRouter = require("./routers/paymentRouter");
const contactRouter = require("./routers/contactRouter");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Apply raw body parser only for webhook route
app.use('/api/payment/webhook', express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/api', profileRouter);
app.use('/api', requestRouter);
app.use('/api', userRouter);
app.use('/api', chatRouter);
app.use('/api', messageRouter);
app.use('/api', paymentRouter); 
app.use('/api', contactRouter);

// ✅ Initialize socket
initSocket(io);

const port = process.env.PORT;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  });