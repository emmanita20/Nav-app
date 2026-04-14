const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Get All Staff
router.get(
  "/",
  [verifyToken, verifyRole("admin", "staff")],
  async (req, res) => {
    try {
      const { buildingId, role } = req.query;
      const filter = { role: { $in: ["staff", "responder"] }, isActive: true };

      if (buildingId) {
        filter["staffInfo.buildingAssignment"] = buildingId;
      }

      if (role) {
        filter.role = role;
      }

      const staff = await User.find(filter)
        .select("-password -otpToken")
        .limit(100);

      res.json({ staff });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get All Responders on Duty
router.get("/on-duty/list", verifyToken, async (req, res) => {
  try {
    const responders = await User.find({
      role: "responder",
      isActive: true,
    }).select("firstName lastName currentLocation phone");

    res.json({ responders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Staff Details
router.get(
  "/:staffId",
  [verifyToken, verifyRole("admin", "staff")],
  async (req, res) => {
    try {
      const staff = await User.findById(req.params.staffId).select(
        "-password -otpToken",
      );

      if (!staff || !["staff", "responder"].includes(staff.role)) {
        return res.status(404).json({ error: "Staff not found" });
      }

      res.json({ staff });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Update Staff Information (Admin only)
router.put(
  "/:staffId",
  [verifyToken, verifyRole("admin"), body("staffInfo").optional()],
  async (req, res) => {
    try {
      const { staffInfo } = req.body;

      const staff = await User.findByIdAndUpdate(
        req.params.staffId,
        { staffInfo },
        { new: true },
      ).select("-password -otpToken");

      res.json({ message: "Staff updated", staff });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Staff Location (for emergency routing)
router.get("/:staffId/location", verifyToken, async (req, res) => {
  try {
    const staff = await User.findById(req.params.staffId);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res.json({
      staffId: staff._id,
      currentLocation: staff.currentLocation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
