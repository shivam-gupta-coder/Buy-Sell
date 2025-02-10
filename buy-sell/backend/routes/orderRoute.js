// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/authenticateToken');
const bcrypt = require('bcryptjs');
const Product = require("../models/Product");
const Cart = require("../models/Cart");


router.post('/add', auth, async (req, res) => {
    try {
      // console.log(req.body);
      const { sellerId, amount, product } = req.body;
      const buyerId = req.user._id; // from auth middleware
  
      const productId = product.productId;
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      const newOrder = new Order({
        buyerId,
        sellerId,
        amount,
        product : {productId, quantity: product.quantity},
        status: false,
        hashed_otp: await bcrypt.hash(otp, 10)
      });
  
      const savedOrder = await newOrder.save();
  
      // Update product quantities
     
      await Product.findByIdAndUpdate(
        product.productId,
        { 
          $inc: { quantity: -product.quantity }, 
          $set: { completed: true } 
        }
      );
      
    
      // now we want to remove this item from carts of all other users as it is ordered

      const result = await Cart.updateMany(
        { "items.product": productId }, // Find carts containing this product
        { $pull: { items: { product: productId } } } // Remove matching items
      );

      // If no carts were modified, return not found
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Product not found in any cart" });
      }

      // // Populate seller and product details
      // const populatedOrder = await Order.findById(savedOrder._id)
      //   .populate('sellerId', 'firstName lastName email')
      //   .populate('product.productId', 'name price description');
  
      res.status(200).json({ message: 'Order created successfully', order: savedOrder, otp });
  
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

// Get all orders for the logged-in user (as buyer or seller)
router.get('/orders', auth, async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware
        console.log(userId);
        // Fetch all orders where user is either buyer or seller
        const orders = await Order.find({
          $or: [{ buyerId: userId }, { sellerId: userId }]
        })
          .populate('buyerId', 'name email') // Populate buyer details
          .populate('sellerId', 'name email') // Populate seller details
          .populate('product.productId')
          .sort({ createdAt: -1 }) // Sort by createdAt (newest first)
          .exec();

        console.log(orders);
       
        const categorizedOrders = {
            pending: orders.filter(order => 
                order.buyerId._id.toString() === userId.toString() && 
                order.status === false
            ),
            bought: orders.filter(order => 
                order.buyerId._id.toString() === userId.toString() && 
                order.status !== false
            ),
            sold: orders.filter(order => 
                order.sellerId._id.toString() === userId.toString() &&
                order.status !== false
            )
        };
        // console.log(hello);
        res.status(200).json(categorizedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get a single order by ID
router.get('/orders/:orderId', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const order = await Order.findOne({
            _id: req.params.orderId,
            $or: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        })
        .populate('items.productId')
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// Verify OTP and update order status
router.post('/orders/:orderId/verify-otp', auth, async (req, res) => {
    try {
        const { otp } = req.body;
        const order = await Order.findOne({
            _id: req.params.orderId,
            buyerId: req.user._id
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isValid = await order.verifyOTP(otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        order.status = 'confirmed';
        await order.save();

        res.json({ message: 'OTP verified successfully', order });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});
// // In your orders route file
// router.post('/rate-seller', authenticateToken, async (req, res) => {
//   try {
//     const { orderId, rating, feedback } = req.body;
    
//     // 1. Find the order
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ error: 'Order not found' });

//     // 2. Find the seller
//     const seller = await User.findById(order.sellerId);
//     if (!seller) return res.status(404).json({ error: 'Seller not found' });

//     // 3. Update seller review
//     seller.sellerReview = {
//       rating: parseFloat(rating),
//       feedback: feedback.trim()
//     };

//     // 4. Save and respond
//     await seller.save();
//     res.json({ message: 'Rating submitted successfully' });
//   } catch (error) {
//     console.error('Rating error:', error);
//     res.status(500).json({ error: 'Failed to submit rating' });
//   }
// });

module.exports = router;