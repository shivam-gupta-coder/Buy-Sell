import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Box,
  Grid,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  DeleteOutline as DeleteIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState({});
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchCartItems();
  }, []);

  async function fetchCartItems() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('User not authenticated');
        window.location.href = '/login';
      }
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        const items = response.data;
        if (items.length === 0) {
          setCartItems([]);
          setTotal(0);
          console.log('Cart is empty');
          return;
        }
        const totalAmount = items.reduce((sum, cartItem) => {
          return sum + cartItem.items.reduce(
            (itemSum, item) => itemSum + item.product.price * item.quantity,
            0
          );
        }, 0);
        setCartItems(items);
        setTotal(totalAmount);
      } else {
        console.error('Failed to fetch cart items:', response.statusText);
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
    }
  }

  async function removeCartItem(itemId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Item removed successfully', response.data);
      fetchCartItems();
    } catch (error) {
      console.error('Remove item error:', error.response ? error.response.data : error);
    }
  }

  async function updateCartItemQuantity(itemId, newQuantity) {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/cart/update',
        { itemId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Item quantity updated successfully');
      fetchCartItems();
    } catch (error) {
      localStorage.removeItem('token');
      console.error('Update item quantity error:', error);
      window.href.location = '/login';
    }
  }

  async function handleBuyNow(item) {
    console.log(item);
    setLoading(prev => ({ ...prev, [item._id]: true }));
    try {
      const token = localStorage.getItem('token');
      const order = {
        sellerId: item.product.sellerId,
        amount: item.product.price * item.quantity,
        product: {
          productId: item.product._id,
          quantity: item.quantity,
          priceAtTime: item.product.price,
        },
      };
      const response = await axios.post('http://localhost:5000/api/orders/add', order, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Order placed successfully', response.data);
      setLoading(prev => ({ ...prev, [item._id]: false }));
      fetchCartItems(); 
    } catch (error) {
      console.error('Buy now error:', error);
      setLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          Your Cart
        </Typography>
      </Box>

      {cartItems.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((cartItem) => (
              <Box key={cartItem._id} sx={{ mb: 3 }}>
                {cartItem.items.map((item) => (
                  <Card
                    key={item._id}
                    sx={{
                      mb: 2,
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6" gutterBottom>
                            {item.product.name}
                          </Typography>
                          <Typography variant="body1" color="primary" gutterBottom>
                            ₹{item.product.price.toFixed(2)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                onClick={() => updateCartItemQuantity(item._id, Math.max(1, item.quantity - 1))}
                                size="small"
                                color="primary"
                              >
                                <RemoveIcon />
                              </IconButton>
                              <Typography sx={{ minWidth: '40px', textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                onClick={() => updateCartItemQuantity(item._id, item.quantity + 1)}
                                size="small"
                                color="primary"
                              >
                                <AddIcon />
                              </IconButton>
                            </Box> */}
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => removeCartItem(item._id)}
                              >
                                Remove
                              </Button>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleBuyNow(item)}
                                disabled={loading[item._id]}
                              >
                                {loading[item._id] ? (
                                  <CircularProgress size={24} color="inherit" />
                                ) : (
                                  'Buy Now'
                                )}
                              </Button>
                            </Box>
                          </Box>
                          
                          <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'right' }}>
                            Subtotal: ₹{(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default CartPage;