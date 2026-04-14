const mongoose = require("mongoose");

const navigationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // Route Information
  startLocation: {
    buildingId: mongoose.Schema.Types.ObjectId,
    floorId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
    coordinates: { lat: Number, lng: Number },
  },

  endLocation: {
    buildingId: mongoose.Schema.Types.ObjectId,
    floorId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
    coordinates: { lat: Number, lng: Number },
  },

  // Navigation Session
  sessionId: String,
  routeId: mongoose.Schema.Types.ObjectId,

  // Tracking
  locationUpdates: [
    {
      lat: Number,
      lng: Number,
      timestamp: Date,
      floor: Number,
    },
  ],

  // Metrics
  startTime: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endTime: Date,
  duration: Number, // seconds
  distanceTraveled: Number, // meters
  deviationsCount: Number,

  // User Behavior
  userConfused: Boolean,
  usedAltRoute: Boolean,
  voiceCommandsUsed: [String],

  // Completion
  completed: Boolean,
  completionRate: Number, // percentage

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Indexes
navigationLogSchema.index({ userId: 1, startTime: -1 });
navigationLogSchema.index({ startTime: -1 });

module.exports = mongoose.model("NavigationLog", navigationLogSchema);
