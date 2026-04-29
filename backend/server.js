require("dotenv").config();
const app = require("./src/app");
const connectToDatabase = require("./src/db/db");
const http = require("http");
const socketIO = require("socket.io");
// const agendaScheduler = require("./src/services/agenda.scheduler");

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

// Initialize Agenda scheduler
const mongoUri =
  process.env.DATABASE_URI || "mongodb://localhost:27017/ecommerce";
// agendaScheduler.initializeAgenda(mongoUri).catch((error) => {
//   console.error("Failed to initialize agenda scheduler:", error);
//   process.exit(1);
// });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
//   await agendaScheduler.stopAgenda();
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });
})
server.listen(port, () => {
  console.log("server started successfully at port:" + port);
});
