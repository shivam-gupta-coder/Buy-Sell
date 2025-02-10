const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/authenticateToken');
const bcrypt = require('bcryptjs');
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { tracingChannel } = require('diagnostics_channel');

router.post("/generate-otp", auth, async (req, res) => {
    try {
      const { orderId } = req.body;
  
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      order.hashed_otp = await bcrypt.hash(otp, 10);
      await order.save();
  
      return res.status(200).json({ otp });
    } catch (error) {
      console.error("Error generating OTP:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/',auth, async (req, res) => { 

    try {
        const orders = await Order.find({ sellerId: req.user._id, status: false })
        .populate('product.productId')
        .populate('buyerId')
        .select('-hashed_otp'); // Exclude hashed_otp field
      
        return res.status(200).json(orders);
    } catch (error) {   
        return res.status(500).json(error);
    }

});


router.post('/complete',auth , async (req,res)=>{
    try {
        const user = req.user;
        const {orderId, otp} = req.body;
        const order = await Order.findById(orderId);
        const isMatch = await bcrypt.compare(otp, order.hashed_otp);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid OTP'});
        }
        order.status = true;
        await order.save();
        return res.status(200).json({message: 'Order completed successfully'});
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;