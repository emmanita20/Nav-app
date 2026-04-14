const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
    index: true,
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Floor",
    required: true,
    index: true,
  },

  roomName: {
    type: String,
    required: true,
    index: true,
  },
  roomNumber: String,
  roomType: {
    type: String,
    enum: [
      "ward",
      "icu",
      "lab",
      "office",
      "classroom",
      "restroom",
      "cafeteria",
      "staircase",
      "elevator",
      "other",
    ],
    required: true,
    index: true,
  },

  // Location in floor (X, Y coordinates)
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },

  // Dimensions
  width: Number,
  height: Number,

  // Room Details
  capacity: Number,
  description: String,

  // Accessibility
  wheelchairAccessible: Boolean,
  emergencyRoom: Boolean,

  // Tags/Keywords for search
  tags: [String],

  // Staff assigned
  assignedStaff: [mongoose.Schema.Types.ObjectId],

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
});

// Indexes
roomSchema.index({ buildingId: 1, floorId: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ roomName: "text", tags: "text" }); // Text search

module.exports = mongoose.model("Room", roomSchema);
