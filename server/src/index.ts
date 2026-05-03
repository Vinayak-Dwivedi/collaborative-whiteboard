// server/src/index.ts

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors()); // Use cors middleware

const server = http.createServer(app);

// Initialize Socket.IO server with CORS configuration
// server/src/index.ts

const io = new Server(server, {
  cors: {
    origin: ["https://vinay-whiteboard.netlify.app", "http://localhost:5173"], // Allow both origins
    methods: ["GET", "POST"],
  },
});

// Listen for new connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for 'draw' events from a client
  socket.on("draw", (data) => {
    // Broadcast the drawing data to all other clients
    socket.broadcast.emit("draw", data);
  });

  // Listen for 'drawShape' events from a client
  socket.on("drawShape", (data) => {
    // Broadcast the shape drawing data to all other clients
    socket.broadcast.emit("drawShape", data);
  });

  // Listen for 'clearCanvas' events from a client
  socket.on("clearCanvas", () => {
    // Broadcast the clear canvas event to all other clients
    socket.broadcast.emit("clearCanvas");
  });

  // Listen for disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
