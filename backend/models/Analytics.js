const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  // Type of analytics
  type: {
    type: String,
    enum: [
      "room_visit",
      "emergency_response",
      "navigation_pattern",
      "user_behavior",
      "system_performance",
    ],
    required: true,
    index: true,
  },

  // Data Points
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    index: true,
  },
  roomId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,

  // Metrics
  value: mongoose.Schema.Types.Mixed,

  // Time-based grouping
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  hour: Number,
  dayOfWeek: Number,
  month: Number,

  // Aggregated Data
  data: {
    visitCount: Number,
    uniqueUsers: Number,
    averageStayTime: Number,
    peakHours: [Number],
    crowdDensity: Number,
    responseTime: Number, // for emergency
    successRate: Number, // for navigation
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: Date,
});

// Indexes for time-series queries
analyticsSchema.index({ type: 1, buildingId: 1, date: -1 });
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
