const express = require("express");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authenticateToken");
const router = express.Router();

// Add a new product
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Assuming req.user contains the authenticated user's info (like their name)
    const sellerName = req.user.name; // The name of the authenticated user

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      sellerName, // Adding the seller's name to the product
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
