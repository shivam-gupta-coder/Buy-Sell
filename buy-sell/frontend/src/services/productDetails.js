import axios from "axios";

// Function to fetch product details from the backend
export const fetchProductDetails = async (productId) => {
  try {
    const response = await axios.get(`/api/productDetails/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Add JWT token for authentication
      },
    });
    return response.data; // Return the product details
  } catch (err) {
    throw new Error("Failed to load product details."); // Throw an error if the request fails
  }
};