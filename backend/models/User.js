const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },

  // Role-based Access
  role: {
    type: String,
    enum: ["user", "staff", "responder", "admin"],
    default: "user",
    index: true,
  },

  // Authentication
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  phoneOtpVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  otpToken: String,
  otpExpiry: Date,

  // Location Data
  currentLocation: {
    lat: Number,
    lng: Number,
    buildingId: mongoose.Schema.Types.ObjectId,
    floorId: mongoose.Schema.Types.ObjectId,
    roomId: mongoose.Schema.Types.ObjectId,
    isIndoor: Boolean,
    timestamp: Date,
  },
  lastKnownLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date,
  },

  // Emergency Info
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relationship: String,
    },
  ],
  hasDisability: Boolean,
  disabilityType: String,
  preferredLanguage: {
    type: String,
    default: "en",
  },

  // Preferences
  preferences: {
    voiceNavigation: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
  },

  // Staff Info (if role is staff/responder)
  staffInfo: {
    department: String,
    designation: String,
    buildingAssignment: [mongoose.Schema.Types.ObjectId],
    licenseNumber: String,
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "currentLocation.buildingId": 1 });

module.exports = mongoose.model("User", userSchema);
