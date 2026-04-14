const express = require("express");
const Analytics = require("../models/Analytics");
const NavigationLog = require("../models/NavigationLog");
const EmergencyAlert = require("../models/EmergencyAlert");
const Room = require("../models/Room");
const User = require("../models/User");
const { verifyToken, verifyRole } = require("../middleware/auth");

const router = express.Router();

// Get Room Visit Analytics
router.get(
  "/room-analytics",
  [verifyToken, verifyRole("admin", "staff")],
  async (req, res) => {
    try {
      const { buildingId, startDate, endDate } = req.query;

      const logs = await NavigationLog.aggregate([
        {
          $match: {
            startTime: {
              $gte: new Date(
                startDate || Date.now() - 30 * 24 * 60 * 60 * 1000,
              ),
              $lte: new Date(endDate || Date.now()),
            },
          },
        },
        {
          $group: {
            _id: "$endLocation.roomId",
            visitCount: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            avgDuration: { $avg: "$duration" },
          },
        },
        {
          $project: {
            roomId: "$_id",
            visitCount: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            avgDuration: 1,
          },
        },
        { $sort: { visitCount: -1 } },
        { $limit: 20 },
      ]);

      res.json({ analytics: logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Emergency Response Analytics
router.get(
  "/emergency-analytics",
  [verifyToken, verifyRole("admin", "staff")],
  async (req, res) => {
    try {
      const { buildingId, startDate, endDate } = req.query;

      const alerts = await EmergencyAlert.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                startDate || Date.now() - 30 * 24 * 60 * 60 * 1000,
              ),
              $lte: new Date(endDate || Date.now()),
            },
          },
        },
        {
          $group: {
            _id: "$alertType",
            count: { $sum: 1 },
            avgResponseTime: {
              $avg: { $subtract: ["$resolvedAt", "$createdAt"] },
            },
          },
        },
      ]);

      res.json({ emergencyAnalytics: alerts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get User Navigation Patterns
router.get(
  "/navigation-patterns",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const patterns = await NavigationLog.aggregate([
        {
          $group: {
            _id: {
              start: "$startLocation.roomId",
              end: "$endLocation.roomId",
            },
            frequency: { $sum: 1 },
            avgTime: { $avg: "$duration" },
          },
        },
        { $sort: { frequency: -1 } },
        { $limit: 20 },
      ]);

      res.json({ patterns });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Peak Hours Analysis
router.get(
  "/peak-hours",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const peakHours = await NavigationLog.aggregate([
        {
          $project: {
            hour: { $hour: "$startTime" },
          },
        },
        {
          $group: {
            _id: "$hour",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({ peakHours });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Crowd Density Heat Map
router.get(
  "/crowd-heatmap",
  [verifyToken, verifyRole("admin", "staff")],
  async (req, res) => {
    try {
      const { buildingId } = req.query;

      const heatmap = await User.aggregate([
        {
          $match: {
            "currentLocation.buildingId":
              require("mongoose").Types.ObjectId(buildingId),
          },
        },
        {
          $group: {
            _id: "$currentLocation.roomId",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({ heatmap });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get Navigation Success Rate
router.get(
  "/success-rate",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const totalNavigations = await NavigationLog.countDocuments();
      const successfulNavigations = await NavigationLog.countDocuments({
        completed: true,
      });
      const successRate = (successfulNavigations / totalNavigations) * 100;

      res.json({
        successRate: successRate.toFixed(2),
        total: totalNavigations,
        successful: successfulNavigations,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Get User Demographics
router.get(
  "/user-demographics",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const demographics = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({ demographics });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Generate Custom Report
router.post(
  "/generate-report",
  [verifyToken, verifyRole("admin")],
  async (req, res) => {
    try {
      const { reportType, startDate, endDate, buildingId } = req.body;

      let data = {};

      switch (reportType) {
        case "emergency_response":
          data = await EmergencyAlert.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            "location.buildingId": buildingId,
          });
          break;

        case "navigation_logs":
          data = await NavigationLog.find({
            startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          }).limit(1000);
          break;

        case "room_visits":
          data = await Room.find({ buildingId });
          break;

        default:
          return res.status(400).json({ error: "Invalid report type" });
      }

      res.json({
        report: {
          type: reportType,
          generatedAt: new Date(),
          period: { start: startDate, end: endDate },
          data,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
