const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");
const twilio = require("twilio");

const router = express.Router();

// Initialize Twilio client only if credentials are valid
let twilioClient = null;
const twilioEnabled =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
  process.env.TWILIO_AUTH_TOKEN;

if (twilioEnabled) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
}

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "default_secret",
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" },
  );
};

// Sign Up
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create new user
      user = new User({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: "user",
      });

      await user.save();

      // Send verification email (implement email service)
      // sendVerificationEmail(user.email);

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        message: "User created successfully",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          currentLocation: user.currentLocation,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Send OTP
router.post("/send-otp", [body("phone").isMobilePhone()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ error: "No account found for this phone" });
    }

    // Send SMS via Twilio
    if (twilioEnabled) {
      try {
        await twilioClient.messages.create({
          body: `Your Navi-App OTP is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      } catch (smsErr) {
        console.warn("Failed to send OTP SMS:", smsErr.message);
        return res.status(500).json({
          error: "Failed to send OTP. SMS service not available.",
        });
      }
    } else {
      console.warn("Twilio not configured. OTP SMS cannot be sent.");
      return res.status(500).json({
        error: "SMS service not configured",
        message: "OTP cannot be sent at this time",
      });
    }

    user.otpToken = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post(
  "/verify-otp",
  [body("phone").isMobilePhone(), body("otp").isLength({ min: 6, max: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, otp } = req.body;

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check OTP expiry
      if (new Date() > user.otpExpiry) {
        return res.status(401).json({ error: "OTP expired" });
      }

      // Verify OTP
      if (String(user.otpToken) !== String(otp)) {
        return res.status(401).json({ error: "Invalid OTP" });
      }

      // Update user
      user.phoneOtpVerified = true;
      user.otpToken = null;
      user.otpExpiry = null;
      await user.save();

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        message: "Phone verified successfully",
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Refresh Token
router.post("/refresh-token", (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Invalid refresh token" });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
          return res.status(403).json({ error: "Invalid refresh token" });
        }

        const accessToken = generateAccessToken(user);

        res.json({ accessToken });
      },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout (client-side mainly)
router.post("/logout", verifyToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Get Current User
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -otpToken",
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
