const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const EmergencyAlert = require("../models/EmergencyAlert");
const Building = require("../models/Building");
const { verifyToken, verifyRole } = require("../middleware/auth");
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

// Create Emergency Alert (SOS)
router.post("/sos", verifyToken, async (req, res) => {
  try {
    const { alertType = "medical", description } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user.currentLocation) {
      return res.status(400).json({ error: "Location not available" });
    }

    // Create emergency alert
    const alert = new EmergencyAlert({
      userId,
      alertType,
      description,
      location: {
        lat: user.currentLocation.lat,
        lng: user.currentLocation.lng,
        buildingId: user.currentLocation.buildingId,
        floorId: user.currentLocation.floorId,
        roomId: user.currentLocation.roomId,
      },
      severity: "high",
      status: "active",
    });

    await alert.save();

    // Find nearby responders
    const responders = await User.find({
      role: { $in: ["staff", "responder"] },
      "staffInfo.buildingAssignment": user.currentLocation.buildingId,
      isActive: true,
    }).select("phone firstName lastName");

    // Send notifications
    await sendEmergencyNotifications(alert, user, responders);

    res.status(201).json({
      message: "Emergency alert created",
      alert: {
        id: alert._id,
        status: alert.status,
        location: alert.location,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send emergency notifications
const sendEmergencyNotifications = async (alert, user, responders) => {
  try {
    // Send SMS to responders
    for (let responder of responders) {
      if (responder.phone && twilioEnabled) {
        try {
          await twilioClient.messages.create({
            body: `EMERGENCY: ${user.firstName} ${user.lastName} needs help. Location: ${alert.location.description || "Building"}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: responder.phone,
          });
        } catch (smsErr) {
          console.warn("Failed to send SMS to responder:", smsErr.message);
        }
      }
    }

    // Send SMS to emergency contacts
    for (let contact of user.emergencyContacts || []) {
      if (contact.phone && twilioEnabled) {
        try {
          await twilioClient.messages.create({
            body: `Emergency Alert: ${user.firstName} has triggered an emergency alert. Status: Being addressed by responders.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone,
          });
        } catch (smsErr) {
          console.warn(
            "Failed to send SMS to emergency contact:",
            smsErr.message,
          );
        }
      }
    }

    // Update alert notification status
    alert.notificationsSent = {
      hospitalSecurity: true,
      emergencyServices: true,
      emergencyContacts: true,
      smsAlert: true,
      pushNotification: true,
    };
    await alert.save();
  } catch (err) {
    console.error("Notification error:", err);
  }
};

// Get Emergency Alerts (for staff/admin)
router.get(
  "/alerts",
  [verifyToken, verifyRole("staff", "admin")],
  async (req, res) => {
    try {
      const { status = "active", buildingId } = req.query;
      const filter = { status };

      if (buildingId) {
        filter["location.buildingId"] = buildingId;
      }

      const alerts = await EmergencyAlert.find(filter)
        .populate("userId", "firstName lastName phone")
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ alerts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Assign Responder to Alert
router.post(
  "/alerts/:alertId/assign-responder",
  [verifyToken, verifyRole("staff", "admin"), body("responderId").notEmpty()],
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { responderId } = req.body;

      const alert = await EmergencyAlert.findById(alertId);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      // Add responder
      alert.responders.push({
        responderId,
        status: "assigned",
        eta: 300, // 5 minutes estimate
      });

      await alert.save();

      // Notify responder
      const responder = await User.findById(responderId);
      if (responder?.phone && twilioEnabled) {
        try {
          await twilioClient.messages.create({
            body: `You have been assigned to emergency alert ID: ${alert._id}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: responder.phone,
          });
        } catch (smsErr) {
          console.warn("Failed to send SMS to responder:", smsErr.message);
        }
      }

      res.json({ message: "Responder assigned", alert });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Update Responder Status
router.put(
  "/alerts/:alertId/responder-status",
  [
    verifyToken,
    body("responderId").notEmpty(),
    body("status").isIn(["assigned", "en_route", "arrived", "completed"]),
  ],
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { responderId, status } = req.body;

      const alert = await EmergencyAlert.findById(alertId);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      const responder = alert.responders.find(
        (r) => r.responderId.toString() === responderId,
      );
      if (!responder) {
        return res.status(404).json({ error: "Responder not assigned" });
      }

      responder.status = status;
      if (status === "arrived") {
        responder.arrivedAt = new Date();
      }

      // Check if all responders completed
      const allCompleted =
        alert.responders.length > 0 &&
        alert.responders.every((r) => r.status === "completed");
      if (allCompleted) {
        alert.status = "resolved";
        alert.resolvedAt = new Date();
      }

      await alert.save();

      res.json({ message: "Status updated", alert });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Alert Details
router.get("/alerts/:alertId", verifyToken, async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId)
      .populate("userId", "firstName lastName phone")
      .populate("responders.responderId", "firstName lastName");

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User's Emergency History
router.get("/user-alerts", verifyToken, async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel Alert
router.put("/alerts/:alertId/cancel", verifyToken, async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    if (
      alert.userId.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    alert.status = "cancelled";
    await alert.save();

    res.json({ message: "Alert cancelled", alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
