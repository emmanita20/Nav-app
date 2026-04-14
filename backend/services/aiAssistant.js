// AI Assistant Service
class AIAssistantService {
  constructor() {
    this.knowledge = {
      rooms: [],
      departments: [],
      floors: [],
      buildings: [],
    };
  }

  // Initialize knowledge base from database
  async loadKnowledgeBase(buildingData) {
    this.knowledge = buildingData;
  }

  // Process natural language queries
  async processQuery(query, buildingContext) {
    const lowerQuery = query.toLowerCase();

    // Pattern matching for common questions
    if (lowerQuery.includes("where") && lowerQuery.includes("icu")) {
      return this.findRoom("ICU", buildingContext);
    }

    if (lowerQuery.includes("where") && lowerQuery.includes("emergency")) {
      return this.findEmergencyRoom(buildingContext);
    }

    if (lowerQuery.includes("lost") || lowerQuery.includes("stuck")) {
      return this.suggestNearestHelp(buildingContext);
    }

    if (lowerQuery.includes("nearest") && lowerQuery.includes("restroom")) {
      return this.findNearestAmenity("restroom", buildingContext);
    }

    if (lowerQuery.includes("direction") || lowerQuery.includes("how to")) {
      return this.parseDirectionRequest(query, buildingContext);
    }

    // Fallback response
    return {
      response:
        'I can help you navigate. Try asking "Where is the ICU?" or "How do I get to the laboratory?"',
      confidence: 0.5,
    };
  }

  findRoom(roomType, buildingContext) {
    const room = this.knowledge.rooms.find((r) =>
      r.roomType.toLowerCase().includes(roomType.toLowerCase()),
    );

    return {
      response: `The ${roomType} is located on floor ${room?.floor || "unknown"}. Let me guide you there.`,
      room,
      confidence: room ? 0.9 : 0.3,
    };
  }

  findEmergencyRoom(buildingContext) {
    const emergencyRoom = this.knowledge.rooms.find(
      (r) => r.roomType === "emergency",
    );

    return {
      response: `Emergency room is on the first floor. Heading there now.`,
      room: emergencyRoom,
      confidence: 0.95,
    };
  }

  suggestNearestHelp(buildingContext) {
    return {
      response:
        "I detected you might be confused. Let me help. What are you looking for? I can also call for assistance.",
      suggestions: ["Ask a staff member", "Use map view", "Call security"],
      confidence: 0.7,
    };
  }

  findNearestAmenity(amenityType, buildingContext) {
    const amenity = this.knowledge.rooms.find((r) =>
      r.roomType.toLowerCase().includes(amenityType.toLowerCase()),
    );

    return {
      response: `The nearest ${amenityType} is on floor ${amenity?.floor || "unknown"}, just ${amenity?.distance || "a short walk"} away.`,
      room: amenity,
      confidence: amenity ? 0.85 : 0.4,
    };
  }

  parseDirectionRequest(query, buildingContext) {
    // Extract "from X to Y" pattern
    const match = query.match(
      /(?:from|at)\s+(.+?)\s+(?:to|to reach)\s+(.+?)(?:\?|$)/i,
    );

    if (match) {
      const [, from, to] = match;
      return {
        response: `I'll guide you from ${from} to ${to}. Let me calculate the fastest route.`,
        from,
        to,
        confidence: 0.8,
      };
    }

    return {
      response:
        "Could you please specify your starting location and destination?",
      confidence: 0.4,
    };
  }

  // Detect confusion and offer help
  async detectConfusion(navigationData) {
    const { deviations, speed, time } = navigationData;

    const confusionIndicators = {
      multipleDeviations: deviations > 3,
      slowSpeed: speed < 0.5, // m/s
      longerThanExpected: time > navigationData.estimatedTime * 1.5,
      circulatingArea: deviations > 5,
    };

    const confusionScore =
      Object.values(confusionIndicators).filter(Boolean).length;

    if (confusionScore >= 2) {
      return {
        confused: true,
        message:
          "I notice you might be having difficulty finding your way. Would you like me to help?",
        suggestions: [
          "Read directions again",
          "Show map",
          "Call for assistance",
          "Try alternate route",
        ],
        confidence: 0.8,
      };
    }

    return { confused: false };
  }

  // Learning from user interactions
  recordInteraction(query, result, userFeedback) {
    // Store for ML training
    return {
      query,
      result,
      feedback: userFeedback,
      timestamp: new Date(),
    };
  }
}

module.exports = AIAssistantService;
