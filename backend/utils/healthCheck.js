// Health check and monitoring utility
const express = require("express");
const os = require("os");
const mongoose = require("mongoose");

class HealthCheck {
  static getSystemHealth() {
    return {
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
      },
      cpu: os.cpus().length,
      platform: os.platform(),
      freeMemory: os.freemem(),
    };
  }

  static getDatabaseHealth() {
    return {
      connected: mongoose.connection.readyState === 1,
      state: ["disconnected", "connected", "connecting", "disconnecting"][
        mongoose.connection.readyState
      ],
    };
  }

  static getFullHealth() {
    return {
      timestamp: new Date(),
      system: this.getSystemHealth(),
      database: this.getDatabaseHealth(),
      status: "healthy",
    };
  }

  static setupHealthCheckEndpoint(app) {
    app.get("/health", (req, res) => {
      const health = this.getFullHealth();
      res.json(health);
    });

    app.get("/health/ready", (req, res) => {
      if (mongoose.connection.readyState === 1) {
        res.json({ ready: true });
      } else {
        res.status(503).json({ ready: false });
      }
    });
  }
}

module.exports = HealthCheck;
