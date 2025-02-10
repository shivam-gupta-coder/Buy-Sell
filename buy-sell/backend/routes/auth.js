const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authenticateToken = require("../middleware/authenticateToken");
const axios = require("axios");

const JWT_SECRET = "secret_key";
const RECAPTCHA_SECRET_KEY = "6Lcpws0qAAAAAORLm8qWPpa0ycF62WmV3zj9wv5y"; // Your reCAPTCHA secret key

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "30d", // Extended token validity
  });
};

const verifyRecaptcha = async (recaptchaToken) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("Recaptcha verification error:", error);
    return false;
  }
};

// Registration Route
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password,
      recaptchaToken,
    } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({ error: "Recaptcha token is required" });
    }

    const captchaVerified = await verifyRecaptcha(recaptchaToken);
    if (!captchaVerified) {
      return res.status(400).json({ error: "Recaptcha verification failed" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password,
    });

    // Save user (password will be hashed in pre-save middleware)
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Recaptcha token is required' });
    }

    const captchaVerified = await verifyRecaptcha(recaptchaToken);
    if (!captchaVerified) {
      return res.status(400).json({ error: 'Recaptcha verification failed' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Route (Protected)
router.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

// Logout Route
router.post("/logout", authenticateToken, (req, res) => {
  // In JWT, logout is typically handled client-side by removing the token
  res.json({ message: "Logged out successfully" });
});

router.get("/verify-token", authenticateToken, (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;
