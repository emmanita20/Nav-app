const express = require("express");
const { body, validationResult } = require("express-validator");
const Building = require("../models/Building");
const Floor = require("../models/Floor");
const Room = require("../models/Room");
const IndoorRoute = require("../models/IndoorRoute");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Dijkstra's Algorithm for shortest path
class DijkstraNavigator {
  constructor(rooms) {
    this.rooms = rooms;
    this.buildGraph();
  }

  buildGraph() {
    this.graph = {};
    this.rooms.forEach((room) => {
      this.graph[room._id.toString()] = [];
    });

    // Connect adjacent rooms (simple distance-based)
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const dist = this.distance(
          this.rooms[i].coordinates.x,
          this.rooms[i].coordinates.y,
          this.rooms[j].coordinates.x,
          this.rooms[j].coordinates.y,
        );

        if (dist < 100) {
          // Threshold for adjacency
          this.graph[this.rooms[i]._id.toString()].push({
            node: this.rooms[j]._id.toString(),
            weight: dist,
          });
          this.graph[this.rooms[j]._id.toString()].push({
            node: this.rooms[i]._id.toString(),
            weight: dist,
          });
        }
      }
    }
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  findPath(startId, endId) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    this.rooms.forEach((room) => {
      distances[room._id.toString()] = Infinity;
      unvisited.add(room._id.toString());
    });

    distances[startId.toString()] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let minDistance = Infinity;

      for (let node of unvisited) {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          current = node;
        }
      }

      if (current === null) break;

      unvisited.delete(current);

      if ((this.graph[current] || []).length > 0) {
        for (let neighbor of this.graph[current]) {
          if (unvisited.has(neighbor.node)) {
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
              distances[neighbor.node] = alt;
              previous[neighbor.node] = current;
            }
          }
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = endId.toString();

    while (previous[current]) {
      path.unshift(current);
      current = previous[current];
    }
    path.unshift(startId.toString());

    return {
      path,
      distance: distances[endId.toString()],
      pathFound: distances[endId.toString()] !== Infinity,
    };
  }
}

// A* Algorithm for optimized pathfinding
class AStarNavigator {
  constructor(rooms) {
    this.rooms = rooms;
    this.buildGraph();
  }

  buildGraph() {
    this.graph = {};
    this.roomMap = {};

    this.rooms.forEach((room) => {
      this.graph[room._id.toString()] = [];
      this.roomMap[room._id.toString()] = room;
    });

    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const dist = this.distance(
          this.rooms[i].coordinates.x,
          this.rooms[i].coordinates.y,
          this.rooms[j].coordinates.x,
          this.rooms[j].coordinates.y,
        );

        if (dist < 150) {
          this.graph[this.rooms[i]._id.toString()].push({
            node: this.rooms[j]._id.toString(),
            weight: dist,
          });
          this.graph[this.rooms[j]._id.toString()].push({
            node: this.rooms[i]._id.toString(),
            weight: dist,
          });
        }
      }
    }
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  heuristic(currentId, endId) {
    const current = this.roomMap[currentId];
    const end = this.roomMap[endId];

    if (!current || !end) return 0;

    return this.distance(
      current.coordinates.x,
      current.coordinates.y,
      end.coordinates.x,
      end.coordinates.y,
    );
  }

  findPath(startId, endId) {
    const openSet = new Set([startId.toString()]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    const startStr = startId.toString();
    const endStr = endId.toString();

    this.rooms.forEach((room) => {
      gScore[room._id.toString()] = Infinity;
      fScore[room._id.toString()] = Infinity;
    });

    gScore[startStr] = 0;
    fScore[startStr] = this.heuristic(startStr, endStr);

    while (openSet.size > 0) {
      let current = null;
      let minF = Infinity;

      for (let node of openSet) {
        if (fScore[node] < minF) {
          minF = fScore[node];
          current = node;
        }
      }

      if (current === endStr) {
        const path = [current];
        while (cameFrom[current]) {
          current = cameFrom[current];
          path.unshift(current);
        }
        return {
          path,
          distance: gScore[endStr],
          pathFound: true,
        };
      }

      openSet.delete(current);

      for (let neighbor of this.graph[current] || []) {
        const tentativeGScore = gScore[current] + neighbor.weight;

        if (tentativeGScore < gScore[neighbor.node]) {
          cameFrom[neighbor.node] = current;
          gScore[neighbor.node] = tentativeGScore;
          fScore[neighbor.node] =
            gScore[neighbor.node] + this.heuristic(neighbor.node, endStr);

          if (!openSet.has(neighbor.node)) {
            openSet.add(neighbor.node);
          }
        }
      }
    }

    return { path: [], distance: Infinity, pathFound: false };
  }
}

// Find Route Between Two Rooms
router.post(
  "/find-route",
  [
    body("startRoomId").notEmpty(),
    body("endRoomId").notEmpty(),
    body("algorithm").isIn(["dijkstra", "astar"]),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startRoomId, endRoomId, algorithm = "astar" } = req.body;

      // Get start and end rooms
      const startRoom = await Room.findById(startRoomId);
      const endRoom = await Room.findById(endRoomId);

      if (!startRoom || !endRoom) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (startRoom.floorId.toString() === endRoom.floorId.toString()) {
        // Same floor routing
        const rooms = await Room.find({
          floorId: startRoom.floorId,
          isActive: true,
        });

        let navigator;
        if (algorithm === "astar") {
          navigator = new AStarNavigator(rooms);
        } else {
          navigator = new DijkstraNavigator(rooms);
        }

        const result = navigator.findPath(startRoomId, endRoomId);

        if (!result.pathFound) {
          return res.status(404).json({ error: "No route found" });
        }

        // Get detailed path information
        const pathRooms = await Room.find({ _id: { $in: result.path } });
        const directions = generateDirections(result.path, pathRooms);

        const route = new IndoorRoute({
          startRoomId,
          endRoomId,
          buildingId: startRoom.buildingId,
          pathNodes: result.path.map((roomId) => {
            const room = pathRooms.find((r) => r._id.toString() === roomId);
            return {
              floorId: startRoom.floorId,
              x: room?.coordinates.x,
              y: room?.coordinates.y,
            };
          }),
          directions,
          totalDistance: result.distance,
          estimatedTime: Math.ceil(result.distance / 1.4), // average walking speed 1.4 m/s
          complexity:
            result.distance < 50
              ? "easy"
              : result.distance < 200
                ? "medium"
                : "hard",
          algorithm,
        });

        await route.save();

        res.json({
          route: {
            id: route._id,
            startRoom: { id: startRoom._id, name: startRoom.roomName },
            endRoom: { id: endRoom._id, name: endRoom.roomName },
            directions,
            totalDistance: result.distance,
            estimatedTime: route.estimatedTime,
            complexity: route.complexity,
          },
        });
      } else {
        // Multi-floor routing would require additional logic for stairs/elevators
        res
          .status(501)
          .json({ error: "Multi-floor routing not yet implemented" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Helper function to generate turn-by-turn directions
const generateDirections = (path, rooms) => {
  const directions = [];
  let step = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const currentRoom = rooms.find((r) => r._id.toString() === path[i]);
    const nextRoom = rooms.find((r) => r._id.toString() === path[i + 1]);

    if (currentRoom && nextRoom) {
      const instruction = determineDirection(currentRoom, nextRoom);
      directions.push({
        step: step++,
        instruction,
        distance: calculateDistance(currentRoom, nextRoom),
      });
    }
  }

  return directions;
};

const determineDirection = (currentRoom, nextRoom) => {
  const angle =
    (Math.atan2(
      nextRoom.coordinates.y - currentRoom.coordinates.y,
      nextRoom.coordinates.x - currentRoom.coordinates.x,
    ) *
      180) /
    Math.PI;

  if (angle > -45 && angle <= 45) return "Go straight";
  if (angle > 45 && angle <= 135) return "Turn left";
  if (angle > 135 || angle <= -135) return "Turn around";
  if (angle > -135 && angle <= -45) return "Turn right";
};

const calculateDistance = (room1, room2) => {
  return Math.sqrt(
    Math.pow(room2.coordinates.x - room1.coordinates.x, 2) +
      Math.pow(room2.coordinates.y - room1.coordinates.y, 2),
  );
};

// Get Saved Routes
router.get("/saved-routes", verifyToken, async (req, res) => {
  try {
    const routes = await IndoorRoute.find({ isActive: true })
      .populate("startRoomId", "roomName")
      .populate("endRoomId", "roomName")
      .limit(10);

    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
