import axios from "axios";

// Function to fetch all products from the backend
export const fetchAllProducts = async () => {
  try {
    const response = await axios.get("/api/allProducts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Add JWT token for authentication
      },
    });
    return response.data; // Return the fetched products
  } catch (err) {
    throw new Error("Failed to load items."); // Throw an error if the request fails
  }
};
