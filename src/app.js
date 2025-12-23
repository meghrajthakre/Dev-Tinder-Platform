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

const initSocket = require('./sockets'); // ✅ IMPORTANT
const chatRouter = require('./routers/chatRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use("/", chatRouter);
app.use("/", messageRouter);


// ✅ initialize socket
initSocket(io);

const port = 3001;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1); // stop app if DB connection fails
  });
