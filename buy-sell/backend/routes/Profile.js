const express = require("express");
const router = express.Router();
const User = require("../models/User");
const  authenticateToken  = require("../middleware/authenticateToken"); // Middleware to verify token

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Ensure this comes from a validated token
    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      console.warn(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { firstName, lastName, email, age, contactNumber } = req.body;
  
  console.log(req.body);
  try {
    // Validate IIIT email
    const iiitEmailRegex = /^[a-zA-Z0-9._%+-]+@students\.iiit\.ac\.in$/;
    if (email && !iiitEmailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid IIIT email address" });
    }

    // Validate contact number
    const contactRegex = /^\d{10}$/;
    if (contactNumber && !contactRegex.test(contactNumber)) {
      return res.status(400).json({ message: "Invalid contact number" });
    }

    // Validate age
    if (age && age < 18) {
      return res.status(400).json({ message: "Age must be 18 or older" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.age = age || user.age;
    user.contactNumber = contactNumber || user.contactNumber;

    await user.save();

    res.json({ message: "Profile updated successfully", user: user.toObject({ getters: true }) });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
