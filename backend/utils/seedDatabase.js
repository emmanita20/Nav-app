const mongoose = require("mongoose");
const User = require("../models/User");
const Building = require("../models/Building");
const Floor = require("../models/Floor");
const Room = require("../models/Room");

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/navi-app",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Building.deleteMany({}),
      Floor.deleteMany({}),
      Room.deleteMany({}),
    ]);

    // Create sample building
    const hospital = new Building({
      name: "City Hospital",
      type: "hospital",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
      totalFloors: 5,
      description: "Major teaching hospital",
      features: {
        hasElevators: true,
        hasStairs: true,
        hasEmergencyExits: true,
        wheelchairAccessible: true,
        hasParking: true,
      },
    });
    await hospital.save();
    console.log("Created hospital");

    // Create floors
    const floors = [];
    for (let i = 1; i <= 5; i++) {
      const floor = new Floor({
        buildingId: hospital._id,
        floorNumber: i,
        floorName: i === 1 ? "Ground Floor" : `Floor ${i}`,
        description: i === 1 ? "Emergency & Reception" : `Ward & Services`,
      });
      await floor.save();
      floors.push(floor);
    }
    console.log("Created 5 floors");

    // Create rooms
    const roomTypes = ["ward", "icu", "lab", "office", "restroom"];
    let roomCount = 0;

    for (let floor of floors) {
      for (let i = 0; i < 4; i++) {
        const room = new Room({
          buildingId: hospital._id,
          floorId: floor._id,
          roomName: `${roomTypes[i]} ${i + 1}`,
          roomNumber: `${floor.floorNumber}0${i + 1}`,
          roomType: roomTypes[i],
          coordinates: {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
          },
          capacity: Math.floor(Math.random() * 50) + 1,
          wheelchairAccessible: Math.random() > 0.5,
        });
        await room.save();
        roomCount++;
      }
    }
    console.log(`Created ${roomCount} rooms`);

    // Create sample users
    const user = new User({
      firstName: "John",
      lastName: "Doe",
      email: "user@example.com",
      password: "password123",
      phone: "+1234567890",
      role: "user",
      phoneOtpVerified: true,
    });
    await user.save();

    const staff = new User({
      firstName: "Jane",
      lastName: "Smith",
      email: "staff@example.com",
      password: "password123",
      phone: "+0987654321",
      role: "staff",
      staffInfo: {
        designation: "Nurse",
        department: "Emergency",
        buildingAssignment: [hospital._id],
      },
    });
    await staff.save();

    const admin = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });
    await admin.save();

    console.log("Created 3 sample users");
    console.log("\nSeed data created successfully!");
    console.log("\nTest credentials:");
    console.log("User: user@example.com / password123");
    console.log("Staff: staff@example.com / password123");
    console.log("Admin: admin@example.com / password123");

    await mongoose.connection.close();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedDatabase();
