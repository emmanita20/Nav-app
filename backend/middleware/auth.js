const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "default_secret",
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    },
  );
};

// Verify Role
const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

// Verify Refresh Token
const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
      req.user = decoded;
      next();
    },
  );
};

// Encrypt sensitive data
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = "aes-256-cbc";
  const defaultKey = crypto.scryptSync(
    key || "default_encryption_key",
    "salt",
    32,
  );
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, defaultKey, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

// Decrypt sensitive data
const decryptData = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = "aes-256-cbc";
  const defaultKey = crypto.scryptSync(
    key || "default_encryption_key",
    "salt",
    32,
  );

  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, defaultKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
};

module.exports = {
  verifyToken,
  verifyRole,
  verifyRefreshToken,
  encryptData,
  decryptData,
};
