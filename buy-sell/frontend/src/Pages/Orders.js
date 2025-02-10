import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersHistory = () => {
  const [orders, setOrders] = useState({
    pending: [],
    bought: [],
    sold: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [otps, setOTPs] = useState({});

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const handleRateSeller = (order) => {
    setSelectedOrder(order);
    setShowRatingModal(true);
    setRating(order.sellerRating || 0);
    setFeedback(order.sellerFeedback || "");
  };

  const handleSubmitRating = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders/rate-seller",
        {
          orderId: selectedOrder._id,
          rating,
          feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setOrders((prev) => ({
        ...prev,
        bought: prev.bought.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, sellerRating: rating, sellerFeedback: feedback }
            : order
        ),
      }));

      setShowRatingModal(false);
    } catch (error) {
      console.error("Rating submission failed:", error);
      alert("Failed to submit rating. Please try again.");
    }
  };
  const handleOTPUpdate = (orderId, otpValue) => {
    setOTPs((prevOTPs) => ({
      ...prevOTPs,
      [orderId]: otpValue,
    }));
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    verifyToken();
  }, [token]);

  const generateOtp = async (orderId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/deliveritems/generate-otp",
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const otp = response.data.otp;
      console.log("Generated OTP:", otp);

      // Update the state with the received OTP
      handleOTPUpdate(orderId, otp);

      return otp;
    } catch (error) {
      console.error("Error generating OTP:", error.response?.data || error);
      return null;
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/orders/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);
      const { pending = [], bought = [], sold = [] } = response.data || {};

      setOrders({ pending, bought, sold });
      setError(null);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      shipped: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  const OrderCard = ({ order }) => (
    <div
      className="order-card"
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        marginBottom: "16px",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0 }}>Order #{order._id}</h3>
        {/* <span
          style={{
            backgroundColor: getStatusColor(order.status),
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span> */}
      </div>
      <div>
        <p>
          <strong>Amount:</strong> ${order.amount}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
        {order.status === false && (
          <div>
            {otps[order._id] && (
              <p>
                <strong>OTP:</strong> {otps[order._id]}
              </p>
            )}
            <button
              onClick={() => generateOtp(order._id)}
              style={{
                marginTop: "8px",
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Generate OTP
            </button>
          </div>
        )}

        {order.product && order.product.productId && (
          <div>
            <p>
              <strong>Product name:</strong> {order.product.productId.name}
            </p>
            <p>
              <strong>Price:</strong> ${order.product.productId.price}
            </p>
            <p>
              <strong>Quantity:</strong> {order.product.quantity}
            </p>
            <p>
              <strong>Seller:</strong> {order.sellerId.email}
            </p>
          </div>
        )}
      </div>
      {showRatingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Rate Seller for Order #{selectedOrder?._id}</h3>
            <div style={{ margin: "15px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: "24px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: star <= rating ? "#ffd700" : "#ccc",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Enter your feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                marginBottom: "10px",
                padding: "8px",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSubmitRating}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Submit Rating
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1
        style={{
          fontSize: "24px",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Orders History
      </h1>

      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          justifyContent: "space-around",
        }}
      >
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "pending" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Pending Orders ({orders.pending?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("bought")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "bought" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Bought Items ({orders.bought?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("sold")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "sold" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sold Items ({orders.sold?.length || 0})
        </button>
      </div>

      {activeTab === "pending" && (
        <div>
          {orders.pending?.map((order) => (
            <OrderCard key={order.transactionReference} order={order} />
          ))}
          {orders.pending?.length === 0 && (
            <p style={{ textAlign: "center", color: "#777" }}>
              No pending orders
            </p>
          )}
        </div>
      )}

      {activeTab === "bought" && (
        <div>
          {orders.bought?.map((order) => (
            <OrderCard key={order.transactionReference} order={order} />
          ))}
          {orders.bought?.length === 0 && (
            <p style={{ textAlign: "center", color: "#777" }}>
              No purchase history
            </p>
          )}
        </div>
      )}

      {activeTab === "sold" && (
        <div>
          {orders.sold?.map((order) => (
            <OrderCard key={order.transactionReference} order={order} />
          ))}
          {orders.sold?.length === 0 && (
            <p style={{ textAlign: "center", color: "#777" }}>
              No sales history
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
