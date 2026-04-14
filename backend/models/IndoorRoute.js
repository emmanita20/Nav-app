const mongoose = require("mongoose");

const indoorRouteSchema = new mongoose.Schema({
  startRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  endRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
    index: true,
  },

  // Route Data
  pathNodes: [
    {
      floorId: mongoose.Schema.Types.ObjectId,
      x: Number,
      y: Number,
      action: String, // 'move', 'turn', 'stairs', 'elevator'
    },
  ],

  // Directions
  directions: [
    {
      step: Number,
      instruction: String, // "Turn left", "Go straight", "Take elevator to floor 2"
      distance: Number, // meters
      floor: Number,
    },
  ],

  // Route Metrics
  totalDistance: Number, // meters
  estimatedTime: Number, // seconds
  complexity: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },

  // Accessibility
  wheelchairFriendly: Boolean,
  hasSteepStairs: Boolean,

  // Status
  isOptimal: Boolean,
  algorithm: {
    type: String,
    enum: ["dijkstra", "astar", "bfs"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Compound index
indoorRouteSchema.index({ buildingId: 1, startRoomId: 1, endRoomId: 1 });

module.exports = mongoose.model("IndoorRoute", indoorRouteSchema);
