const express = require('express');
const Cart = require('../models/Cart');
const authenticateUser  = require('../middleware/authenticateToken');
const Product = require('../models/Product');
const router = express.Router();

// Add item to cart
router.post('/add', authenticateUser, async (req, res) => {
  console.log(req.user._id);
  try {
    const userId = req.user._id; // Authenticated user's ID
    const { itemId, quantity } = req.body;
    const productId = itemId;
    
    // const { itemId, quantity } = req.body;

    // Validate item exists
    const item = await Product.findById(itemId);
    if (!item) {
      console.log("hello");
      return res.status(404).json({ message: 'Item not found' });
    } 

    // Check if item already in cart
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId});
    }
    let existingItemIndex = -1;
    existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );
    console.log("hello",existingItemIndex);

    if (existingItemIndex > -1) {
      // If product exists, update the quantity
      // cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If product does not exist, add it to the cart
      cart.items.push({
        product: productId,
        quantity:1,
      });
    }

    await cart.save();
    return res.status(200).json(cart);

  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json(error);
  }
});
// Get user's cart
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await Cart.find({ user: userId }).populate('items.product');
    res.json(cartItems);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json(error);
  }
});

router.delete('/remove/:itemId', authenticateUser, async (req, res) => { 
  try { 
    const userId = req.user._id; 
    const { itemId } = req.params; 
 
    const cart = await Cart.findOne({ user: userId }); 
    console.log("hello" , cart,itemId);
    if (!cart) { 
      return res.status(404).json({ message: 'Cart not found' }); 
    } 
 
    // Remove the specific item from the cart's items array
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await cart.save(); 
 
    res.status(200).json(cart); 
  } catch (error) { 
    console.error('Remove from cart error:', error); 
    res.status(500).json({ message: 'Server error' }); 
  } 
});
// Update cart item quantity
router.put('/cart/update', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart item updated', cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;