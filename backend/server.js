// ✅ server.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Meeting from "./models/Meeting.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔌 Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST"],
  },
});

// 🧱 Middleware
app.use(cors());
app.use(express.json());

// 🧭 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// 🧩 API — Create Meeting with duration
app.post("/api/meeting/create", async (req, res) => {
  try {
    const { lawyerId, duration } = req.body;

    if (!lawyerId || !duration) {
      return res.status(400).json({ error: "lawyerId and duration are required" });
    }

    const meetingId = Math.random().toString(36).substring(2, 10);

    // Save to DB
    const meeting = new Meeting({
      lawyerId,
      meetingId,
      duration, // in minutes
      createdAt: new Date(),
    });

    await meeting.save();

    // Automatically end meeting after duration
    setTimeout(() => {
      console.log(`🕒 Meeting ${meetingId} expired after ${duration} minutes`);
      io.to(meetingId).emit("meeting-ended", { reason: "Time limit reached" });
    }, duration * 60 * 1000);

    res.status(200).json({ meetingId });
  } catch (err) {
    console.error("❌ Error creating meeting:", err);
    res.status(500).json({ error: "Error creating meeting" });
  }
});

// ⚡ SOCKET.IO — Realtime communication
// ⚡ SOCKET.IO — Realtime communication
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Join meeting room
  socket.on("join-call", (roomId, name) => {
    socket.join(roomId);
    socket.data.name = name; // Store the user's name on their socket
    console.log(`👥 User ${socket.id} (Name: ${name}) joined room ${roomId}`);

    // 1. Get all socket IDs in the room
    const socketIdsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    // 2. Map IDs to an array of objects: [{ id, name }, { id, name }, ...]
    const clients = socketIdsInRoom.map(id => {
      const socketInstance = io.sockets.sockets.get(id);
      return {
        id: id,
        name: socketInstance ? socketInstance.data.name : "Unknown" // Get the stored name
      };
    });

    // 3. Emit the new user's info AND the full client list to everyone
    io.to(roomId).emit("user-joined", socket.id, name, clients);

    // WebRTC signaling
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // Chat messages
    socket.on("chat-message", (msg, sender) => {
      io.to(roomId).emit("chat-message", msg, sender, socket.id);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.id} (Name: ${socket.data.name}) disconnected`);
       // Let everyone know this user left and pass their ID
      io.to(roomId).emit("user-left", socket.id);
    });
  });
});

// 🟢 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
