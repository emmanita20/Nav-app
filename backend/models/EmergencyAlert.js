const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  alertType: {
    type: String,
    enum: ["medical", "accident", "fire", "security", "panic", "other"],
    required: true,
    index: true,
  },

  // Location Details
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
    floorId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
    description: String,
  },

  // Alert Details
  description: String,
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "high",
  },

  // Response
  responders: [
    {
      responderId: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ["assigned", "en_route", "arrived", "completed"],
        default: "assigned",
      },
      arrivedAt: Date,
      eta: Number, // seconds
    },
  ],

  status: {
    type: String,
    enum: ["active", "responded", "resolved", "cancelled"],
    default: "active",
    index: true,
  },

  // Notifications
  notificationsSent: {
    hospitalSecurity: Boolean,
    emergencyServices: Boolean,
    emergencyContacts: Boolean,
    smsAlert: Boolean,
    pushNotification: Boolean,
  },

  // Media
  attachments: [String], // URLs to photos/videos

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  resolvedAt: Date,
  updatedAt: Date,
});

// Indexes for queries
emergencyAlertSchema.index({ userId: 1, createdAt: -1 });
emergencyAlertSchema.index({ status: 1, createdAt: -1 });
emergencyAlertSchema.index({ "location.buildingId": 1, status: 1 });

module.exports = mongoose.model("EmergencyAlert", emergencyAlertSchema);
