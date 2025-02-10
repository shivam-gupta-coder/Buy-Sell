import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Form, Alert } from 'react-bootstrap';

function ItemDetailsPage() {
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);

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
    async function fetchItemDetails() {
      try {
        const itemId = window.location.pathname.split('/').pop();
        const response = await axios.get(`http://localhost:5000/api/productDetails/${itemId}`);

        if (response.status !== 200) {
          throw new Error('Failed to fetch item details');
        }
        console.log('product is ',response.data.product);
        console.log('review is ',response.data.review);
        setItem(response.data.product);
        setReviews(response.data.review || []); // Set reviews if available
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    }

    fetchItemDetails();
  }, []);

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          itemId: item._id,
          quantity: quantity
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      console.log('Item added to cart:', response.data);
      alert('Item added to cart successfully!');
    } catch (error) {
      console.log(error);
      alert('Failed to add item to cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      alert("Please enter a rating between 1 and 5.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/productDetails/${item._id}/addReview`,
        {
          rating,
          username: user.firstName, // Assuming firstName is the username
          comment: review
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if(response.data.success){
      setReviews([...reviews, response.data.review]); // Add new review to the list
      alert("review added successfully");
      setReview(""); // Reset input
      setRating(0);
      window.location.href = `/productDetails/${item._id}`
      }else{
        alert("Failed to add");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!item) return <div>Loading...</div>;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} className="d-flex justify-content-center mb-4">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="img-fluid" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} 
            />
          )}
        </Col>
        <Col md={6} className="d-flex flex-column justify-content-center align-items-start">
          <h1>{item.name}</h1>
          <h3>Price: ₹{item.price}</h3>
          <h5>Seller: {item.sellerId.email}</h5>

          <div className="my-3">
            <h4>Description</h4>
            <p>{item.description}</p>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={user._id === item.sellerId._id}  // Disable button if user is the seller
            variant="primary"
            className="mt-3 w-100"
          >
            {user._id === item.sellerId._id ? 'You cannot add your own item to the cart' : 'Add to Cart'}
          </Button>

          {/* Review Section */}
          <div className="mt-4 w-100">
            <h4>Leave a Review</h4>
            <Form onSubmit={handleReviewSubmit}>
              <Form.Group controlId="rating">
                <Form.Label>Rating (0-5)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)} 
                  required
                />
              </Form.Group>

              <Form.Group controlId="review">
                <Form.Label>Review</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={review} 
                  onChange={(e) => setReview(e.target.value)} 
                  required
                />
              </Form.Group>

              <Button variant="success" type="submit" className="mt-3 w-100">
                Submit Review
              </Button>
            </Form>
          </div>

          {/* Display Reviews */}
          <div className="mt-4 w-100">
            <h4>Customer Reviews</h4>
            {reviews.length > 0 ? (
              reviews.map((rev, index) => (
                <Alert key={index} variant="light">
                  <strong>{rev.username}</strong> ({rev.rating}/5)
                  <p>{rev.comment}</p>
                </Alert>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ItemDetailsPage;
