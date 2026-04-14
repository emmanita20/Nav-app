const express = require("express");
const { body, validationResult } = require("express-validator");
const Building = require("../models/Building");
const Floor = require("../models/Floor");
const Room = require("../models/Room");
const User = require("../models/User");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Upload Building Map (Admin only)
router.post(
  "/buildings/upload-map",
  [
    verifyToken,
    verifyRole("admin"),
    body("buildingId").notEmpty(),
    body("mapImageUrl").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { buildingId, mapImageUrl, mapData } = req.body;

      const building = await Building.findByIdAndUpdate(
        buildingId,
        { mapImageUrl, mapData },
        { new: true },
      );

      res.json({ message: "Map uploaded", building });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Create Floor (Admin only)
router.post(
  "/floors",
  [
    verifyToken,
    verifyRole("admin"),
    body("buildingId").notEmpty(),
    body("floorNumber").isInt(),
    body("floorName").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { buildingId, floorNumber, floorName, mapImageUrl, mapData } =
        req.body;

      const floor = new Floor({
        buildingId,
        floorNumber,
        floorName,
        mapImageUrl,
        mapData,
      });

      await floor.save();

      res.status(201).json({ message: "Floor created", floor });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Create Room (Admin only)
router.post(
  "/rooms",
  [
    verifyToken,
    verifyRole("admin"),
    body("buildingId").notEmpty(),
    body("floorId").notEmpty(),
    body("roomName").notEmpty(),
    body("roomType").isIn([
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
    ]),
    body("coordinates.x").isFloat(),
    body("coordinates.y").isFloat(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        buildingId,
        floorId,
        roomName,
        roomNumber,
        roomType,
        coordinates,
        capacity,
        tags,
      } = req.body;

      const room = new Room({
        buildingId,
        floorId,
        roomName,
        roomNumber,
        roomType,
        coordinates,
        capacity,
        tags,
      });

      await room.save();

      res.status(201).json({ message: "Room created", room });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Update Room
router.put(
  "/rooms/:roomId",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const { roomName, roomType, capacity, tags } = req.body;

      const room = await Room.findByIdAndUpdate(
        req.params.roomId,
        { roomName, roomType, capacity, tags },
        { new: true },
      );

      res.json({ message: "Room updated", room });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Manage Staff (Add/Remove)
router.post(
  "/staff/assign",
  [
    verifyToken,
    verifyRole("admin"),
    body("staffId").notEmpty(),
    body("buildingId").notEmpty(),
    body("designation").notEmpty(),
  ],
  async (req, res) => {
    try {
      const { staffId, buildingId, designation, department } = req.body;

      const user = await User.findByIdAndUpdate(
        staffId,
        {
          role: "staff",
          staffInfo: {
            designation,
            department,
            buildingAssignment: [buildingId],
          },
        },
        { new: true },
      );

      res.json({ message: "Staff assigned", user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Analytics Dashboard Data
router.get(
  "/dashboard",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const totalBuildings = await Building.countDocuments({ isActive: true });
      const totalStaff = await User.countDocuments({
        role: { $in: ["staff", "responder"] },
        isActive: true,
      });
      const totalUsers = await User.countDocuments({
        role: "user",
        isActive: true,
      });

      res.json({
        dashboard: {
          totalBuildings,
          totalStaff,
          totalUsers,
          timestamp: new Date(),
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Export Building Data
router.get(
  "/buildings/:buildingId/export",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const building = await Building.findById(req.params.buildingId);
      const floors = await Floor.find({ buildingId: req.params.buildingId });
      const rooms = await Room.find({ buildingId: req.params.buildingId });

      const data = {
        building,
        floors,
        rooms,
        exportedAt: new Date(),
      };

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
