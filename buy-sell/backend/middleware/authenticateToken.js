const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const secretKey = "secret_key"; 
    const decoded = jwt.verify(token, secretKey);
    
    console.log("Full Authorization Header:", authHeader);
    console.log("Extracted Token:", token);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(403).json({ 
      error: "Invalid token", 
      details: error.message 
    });
  }
};

module.exports = authenticateToken;