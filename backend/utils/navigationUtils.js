// Utility for calculating navigation metrics
class NavigationUtils {
  // Calculate distance between two points (Haversine formula)
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
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
  }

  // Calculate bearing between two points
  static calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  }

  // Estimate walking time (average 1.4 m/s)
  static estimateWalkingTime(distanceMeters) {
    const averageSpeed = 1.4; // m/s
    return Math.ceil(distanceMeters / averageSpeed);
  }

  // Detect if user is stationary
  static isStationary(prevLoc, currLoc, threshold = 5) {
    const distance = this.calculateDistance(
      prevLoc.lat,
      prevLoc.lng,
      currLoc.lat,
      currLoc.lng,
    );
    return distance < threshold;
  }

  // Calculate route complexity
  static getRouteComplexity(distance, floorChanges = 0) {
    let complexity = "easy";
    if (distance > 200 || floorChanges > 2) complexity = "hard";
    else if (distance > 100 || floorChanges > 0) complexity = "medium";
    return complexity;
  }
}

module.exports = NavigationUtils;
