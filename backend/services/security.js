// Security & Encryption Utilities

const crypto = require("crypto");

class SecurityService {
  // Hash location data for privacy
  static hashLocation(lat, lng, precision = 4) {
    const roundedLat = parseFloat(lat).toFixed(precision);
    const roundedLng = parseFloat(lng).toFixed(precision);

    const data = `${roundedLat}:${roundedLng}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // Encrypt emergency location data
  static encryptEmergencyLocation(location) {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || "default_key",
      "salt",
      32,
    );
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(location), "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  // Decrypt emergency location data
  static decryptEmergencyLocation(encryptedData) {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || "default_key",
      "salt",
      32,
    );

    const parts = encryptedData.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }

  // GDPR Compliance - Data anonymization
  static anonymizeUserData(user) {
    return {
      userId: crypto
        .createHash("sha256")
        .update(user._id.toString())
        .digest("hex"),
      role: user.role,
      createdAt: user.createdAt,
      // Sensitive data removed
    };
  }

  // GDPR Compliance - Right to be forgotten
  static async deleteUserData(userId) {
    // Would trigger deletion of all user-related data
    return {
      message: "User data deletion initiated",
      status: "pending",
    };
  }

  // Validate role-based access
  static validateAccess(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
  }

  // Sanitize input
  static sanitizeInput(input) {
    if (typeof input === "string") {
      return input.replace(/[<>]/g, "").trim().substring(0, 1000); // limit length
    }
    return input;
  }

  // Audit log
  static createAuditLog(action, userId, target, details = {}) {
    return {
      action,
      userId,
      target,
      details,
      timestamp: new Date(),
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
    };
  }

  // Rate limiting
  static checkRateLimit(userId, action, limit = 10, windowMs = 60000) {
    // Implementation would track request counts per user/action
    return { allowed: true, remaining: limit };
  }
}

module.exports = SecurityService;
