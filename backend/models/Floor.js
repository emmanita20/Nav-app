const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true,
    index: true,
  },
  floorNumber: {
    type: Number,
    required: true,
  },
  floorName: String,

  // Floor Details
  mapImageUrl: String,
  mapData: mongoose.Schema.Types.Mixed, // GeoJSON or SVG coordinates
  area: Number, // sqft
  description: String,

  // Accessibility
  hasElevator: Boolean,
  hasStairs: Boolean,
  emergencyExitCount: Number,
  emergencyExitLocations: [
    {
      name: String,
      x: Number,
      y: Number,
    },
  ],

  // Environment
  areaType: {
    type: String,
    enum: ["general", "emergency", "restricted", "public"],
    default: "general",
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
    index: true,
  },
});

// Compound index
floorSchema.index({ buildingId: 1, floorNumber: 1 });

module.exports = mongoose.model("Floor", floorSchema);
