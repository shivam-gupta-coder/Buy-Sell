const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret_key";
const User = require("../models/User");
// Get product details by ID
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId).populate('sellerId', 'name email');
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const user = await User.findById(product.sellerId);
    console.log(user.reviews);
    res.status(200).json({   product,review : user.reviews,});
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
router.post("/:id/addReview", async (req, res) => {
  const productId=req.params.id;
  console.log(productId);
  const product = await Product.findById(productId);
  console.log('product is',product);

  console.log("Hi here");
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    // const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    // console.log('decoded is ',decoded);
    const userId = product.sellerId;
    console.log(userId);
    const { reviewerId, rating, comment } = req.body;

    // Validate user to be reviewed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    console.log('user is',user)
    // Validate reviewer
    // const reviewer = await User.findById(reviewerId);
     // console.log('reviewer is ',reviewer);
    // if (!reviewer) {
    //   return res.status(404).json({ error: "Reviewer not found." });
    // }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Create review object
    const newReview = {
      rating,
      username: user.firstName + " " + user.lastName, // Reviewer's full name
      comment,
    };

    // Add review to user's reviews array
    user.reviews.push(newReview);
    await user.save();
    console.log(user);
    res.status(201).json({success : "true", message: "Review added successfully.", review:newReview });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success:"false",error: "Internal server error." });
  }
});

module.exports = router;
