const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["hospital", "campus", "mall", "office", "other"],
    required: true,
    index: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  radius: {
    type: Number,
    default: 100, // meters
  },

  // Building Details
  totalFloors: Number,
  totalArea: Number, // sqft
  description: String,

  // Map & Layout
  mapImageUrl: String,
  mapData: mongoose.Schema.Types.Mixed, // GeoJSON or custom format

  // Administration
  adminUsers: [mongoose.Schema.Types.ObjectId],
  staffUsers: [mongoose.Schema.Types.ObjectId],

  // Emergency Info
  emergencyNumber: String,
  security: {
    mainGate: { lat: Number, lng: Number },
    controlRoom: { lat: Number, lng: Number },
  },

  // Features
  features: {
    hasElevators: Boolean,
    hasStairs: Boolean,
    hasEmergencyExits: Boolean,
    wheelchairAccessible: Boolean,
    hasParking: Boolean,
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

// Coordinate fields are stored as lat/lng numbers, so use a normal compound
// index and calculate radius matches in application code.
buildingSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

module.exports = mongoose.model("Building", buildingSchema);
