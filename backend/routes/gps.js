const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Building = require("../models/Building");
const NavigationLog = require("../models/NavigationLog");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Utility function to detect if user is indoors
const detectIndoorLocation = async (lat, lng) => {
  try {
    const buildings = await Building.find({ isActive: true })
      .select("-mapData")
      .limit(100);

    return (
      buildings.find((building) => {
        const distance = calculateDistance(
          Number(lat),
          Number(lng),
          building.coordinates.lat,
          building.coordinates.lng,
        );
        return distance <= (building.radius || 100);
      }) || null
    );
  } catch (err) {
    console.error("Indoor detection error:", err);
    return null;
  }
};

// Update User Location (every 3 seconds)
router.post(
  "/update-location",
  [body("lat").isFloat(), body("lng").isFloat()],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const lat = Number(req.body.lat);
      const lng = Number(req.body.lng);
      const userId = req.user.userId;

      // Detect if indoors
      const building = await detectIndoorLocation(lat, lng);

      // Update user location
      const user = await User.findByIdAndUpdate(
        userId,
        {
          currentLocation: {
            lat,
            lng,
            buildingId: building ? building._id : null,
            isIndoor: !!building,
            timestamp: new Date(),
          },
          lastKnownLocation: {
            lat,
            lng,
            timestamp: new Date(),
          },
        },
        { new: true },
      );

      res.json({
        message: "Location updated",
        location: user.currentLocation,
        building: building ? { id: building._id, name: building.name } : null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Last Known Location
router.get("/last-location", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.lastKnownLocation) {
      return res.status(404).json({ error: "No location history" });
    }

    res.json({ lastKnownLocation: user.lastKnownLocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All User Locations (for analytics)
router.get("/locations-history", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const logs = await NavigationLog.find({
      userId,
      startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).limit(100);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Nearby Users (for staff/admin)
router.get("/nearby-users", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.currentLocation) {
      return res.status(400).json({ error: "User location not available" });
    }

    const { lat, lng } = user.currentLocation;
    const radius = Number(req.query.radius || 1000);

    const nearbyUsers = (
      await User.find({
        _id: { $ne: req.user.userId },
        isActive: true,
        "currentLocation.lat": { $exists: true },
        "currentLocation.lng": { $exists: true },
      })
        .select("firstName lastName currentLocation role")
        .limit(200)
    ).filter((nearbyUser) => {
      const location = nearbyUser.currentLocation;
      return (
        Number.isFinite(location?.lat) &&
        Number.isFinite(location?.lng) &&
        calculateDistance(lat, lng, location.lat, location.lng) <= radius
      );
    });

    res.json({ nearbyUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Building Info for Current Location
router.get("/current-building", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.currentLocation?.buildingId) {
      return res.status(404).json({ error: "Not inside any building" });
    }

    const building = await Building.findById(
      user.currentLocation.buildingId,
    ).select("-mapData");

    res.json({ building });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Geofencing - Check if entered/exited building
router.post(
  "/geofence-check",
  [body("lat").isFloat(), body("lng").isFloat()],
  verifyToken,
  async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      const previousBuilding = user.currentLocation?.buildingId;

      const currentBuilding = await detectIndoorLocation(lat, lng);
      const currentBuildingId = currentBuilding?._id;

      let event = null;

      if (previousBuilding && !currentBuildingId) {
        event = "exited_building";
      } else if (!previousBuilding && currentBuildingId) {
        event = "entered_building";
      } else if (
        previousBuilding?.toString() !== currentBuildingId?.toString()
      ) {
        event = "switched_building";
      }

      res.json({
        event,
        previousBuilding,
        currentBuilding: currentBuildingId,
        isIndoor: !!currentBuilding,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
