const express = require("express");
const { body, validationResult } = require("express-validator");
const Building = require("../models/Building");
const Floor = require("../models/Floor");
const Room = require("../models/Room");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Get All Buildings
router.get("/", async (req, res) => {
  try {
    const { type, lat, lng, radius = 5000 } = req.query;
    const filter = { isActive: true };

    if (type) {
      filter.type = type;
    }

    let buildings = await Building.find(filter).select("-mapData").limit(50);

    // Filter by location if provided
    if (lat && lng) {
      buildings = buildings.filter((b) => {
        const distance = calculateDistance(
          lat,
          lng,
          b.coordinates.lat,
          b.coordinates.lng,
        );
        return distance <= radius;
      });
    }

    res.json({ buildings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Building Details
router.get("/:buildingId", async (req, res) => {
  try {
    const building = await Building.findById(req.params.buildingId);

    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    res.json({ building });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Building (Admin only)
router.post(
  "/",
  [
    verifyToken,
    verifyRole("admin"),
    body("name").notEmpty(),
    body("type").isIn(["hospital", "campus", "mall", "office", "other"]),
    body("coordinates.lat").isFloat(),
    body("coordinates.lng").isFloat(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        type,
        address,
        coordinates,
        totalFloors,
        description,
        features,
      } = req.body;

      const building = new Building({
        name,
        type,
        address,
        coordinates,
        totalFloors,
        description,
        features,
        adminUsers: [req.user.userId],
      });

      await building.save();

      res.status(201).json({
        message: "Building created",
        building,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Floors of Building
router.get("/:buildingId/floors", async (req, res) => {
  try {
    const floors = await Floor.find({
      buildingId: req.params.buildingId,
      isActive: true,
    }).sort({ floorNumber: 1 });

    res.json({ floors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Rooms of Floor
router.get("/:buildingId/floors/:floorId/rooms", async (req, res) => {
  try {
    const { buildingId, floorId } = req.params;

    const rooms = await Room.find({
      buildingId,
      floorId,
      isActive: true,
    });

    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search Rooms
router.get("/:buildingId/search-rooms", async (req, res) => {
  try {
    const { query } = req.query;
    const buildingId = req.params.buildingId;

    if (!query) {
      return res.status(400).json({ error: "Query parameter required" });
    }

    const rooms = await Room.find(
      {
        buildingId,
        $text: { $search: query },
        isActive: true,
      },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate distance helper
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = router;
