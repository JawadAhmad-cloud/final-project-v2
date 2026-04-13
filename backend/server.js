require("dotenv").config();
const app = require("./src/app");
const connectToDatabase = require("./src/db/db");
const http = require("http");
const socketIO = require("socket.io");

connectToDatabase();
const port = 5000;

// Create HTTP server with Socket.io
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

// Socket.io connection handling
const socketService = require("./src/services/socket.service");
socketService.initializeSocket(io);

server.listen(port, () => {
  console.log("server started successfully at port:" + port);
});
