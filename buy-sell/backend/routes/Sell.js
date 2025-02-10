const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const auth = require("../middleware/authenticateToken");

// Add a new product
router.post("/add", auth,async (req, res) => {
  try {
    const user = req.user;
    console.log(req.body);
    const { name, price, description, category } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // const sellerName = req.user?.name || "Unknown"; // Fallback to 'Unknown' if no user info is found

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      sellerId: user._id,
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


