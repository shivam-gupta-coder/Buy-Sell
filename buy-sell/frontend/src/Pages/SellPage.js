import React, { useState,useEffect } from "react";
import { use } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

const SellItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
  });

  const [message, setMessage] = useState({ text: "", variant: "" });
  const [token,setToken] = useState(localStorage.getItem("token"));
  const [user,setUser] = useState(null);

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
  },[token]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      setMessage({ text: "All fields are required.", variant: "danger" });
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/sell/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 201 || response.status === 200) {
        setMessage({ text: "Item listed successfully!", variant: "success" });
        setFormData({ name: "", description: "", category: "", price: "" });
      } else {
        setMessage({ text: "Error listing item. Try again.", variant: "danger" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ text: "Server error. Please try again later.", variant: "danger" });
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <h2 className="text-center mb-4">Sell an Item</h2>

        {message.text && <Alert variant={message.variant}>{message.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter item name"
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              placeholder="Enter item description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              placeholder="Enter category"
              value={formData.category}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price ($)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            List Item
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default SellItem;
