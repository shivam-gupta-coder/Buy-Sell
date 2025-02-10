import React, { useState, useEffect } from "react";
import { fetchAllProducts } from "../services/allItems"; // Import the service
import axios from "axios";

export default function Items() {
  const [items, setItems] = useState([]); // State to store all items
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(null); // State to store any error message

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


  useEffect(() => {
    // Fetch all items from the backend using the service function
    const fetchItems = async () => {
      try {
        const products = await fetchAllProducts(); // Call the service function
        setItems(products); // Set the fetched products to state
      } catch (err) {
        setError("Failed to load items.");
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchItems();
  }, []); // Empty dependency array to run this effect once when the component is mounted

  if (loading) {
    return <p>Loading...</p>; // Show loading message while data is being fetched
  }

  if (error) {
    return <p>{error}</p>; // Show error message if fetching fails
  }

  return (
    <div className="items-list">
      <h1>All Products</h1>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              <h2>{item.name}</h2>
              <p><strong>Price:</strong> {item.price}</p>
              <p><strong>Vendor:</strong> {item.vendor}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Description:</strong> {item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
