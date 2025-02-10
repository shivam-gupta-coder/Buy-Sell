import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Box } from "@mui/material";
import axios from "axios";

const DeliverItems = () => {
  const [orders, setOrders] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/deliveritems", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(response);

        // Extract necessary details from response data
        const formattedOrders = response.data.map((order) => ({
          _id: order._id,
          itemName: order.product.productId.name,
          price: order.amount,
          buyerId: order.buyerId.email, // Assuming you may fetch buyer details later
        }));

        setOrders(formattedOrders);
      } catch (error) {
        setError("Error fetching orders. Please try again later.");
        console.log("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleOtpChange = (event, orderId) => {
    setOtpInputs({ ...otpInputs, [orderId]: event.target.value });
  };

  const completeTransaction = async (orderId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/deliveritems/complete",
        { orderId, otp: otpInputs[orderId] }, // Send orderId and OTP
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOrders(orders.filter((order) => order._id !== orderId)); // Remove completed order
        setOtpInputs((prev) => {
          const newOtpInputs = { ...prev };
          delete newOtpInputs[orderId];
          return newOtpInputs;
        });
        setError(null);
      } else {
        setError(response.data.message || "Transaction failed. Try again.");
      }
    } catch (error) {
      setError("Error completing order. Please try again.");
      console.error("Error completing order:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Deliver Items
      </Typography>
      {orders.length === 0 ? (
        <Typography>No pending orders.</Typography>
      ) : (
        orders.map((order) => (
          <Card key={order._id} sx={{ marginBottom: 2, padding: 2 }}>
            <CardContent>
              <Typography variant="h6">{order.itemName}</Typography>
              <Typography>Price: ${order.price}</Typography>
              <Typography>Buyer: {order.buyerId}</Typography>
              <TextField
                label="Enter OTP"
                variant="outlined"
                fullWidth
                sx={{ marginY: 1 }}
                value={otpInputs[order._id] || ""}
                onChange={(e) => handleOtpChange(e, order._id)}
              />
              {error && <Typography color="error">{error}</Typography>}
              <Button
                variant="contained"
                color="primary"
                onClick={() => completeTransaction(order._id)}
                disabled={!otpInputs[order._id]} // Disable button if OTP is empty
              >
                Complete Transaction
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default DeliverItems;
