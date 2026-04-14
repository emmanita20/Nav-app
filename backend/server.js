const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
];
const allowedOrigins = (process.env.FRONTEND_URL || defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/navi-app")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const gpsRoutes = require("./routes/gps");
const buildingRoutes = require("./routes/buildings");
const navigationRoutes = require("./routes/navigation");
const emergencyRoutes = require("./routes/emergency");
const staffRoutes = require("./routes/staff");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Live location tracking
  socket.on("update-location", (locationData) => {
    io.emit("location-updated", {
      userId: locationData.userId,
      lat: locationData.lat,
      lng: locationData.lng,
      timestamp: new Date(),
    });
  });

  // Emergency alert
  socket.on("emergency-alert", (alertData) => {
    io.emit("emergency-triggered", alertData);
  });

  // Responder location update
  socket.on("responder-location", (responderData) => {
    socket.broadcast.emit("responder-updated", responderData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server, io };
