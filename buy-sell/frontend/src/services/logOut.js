// authService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Replace with your backend URL

// Existing login and signup functions...

export const logout = async () => {
  try {
    // Optionally, you can call an API route to invalidate the token server-side (though JWTs are stateless).
    // This can be a good practice if you want to log out the user server-side.
    await axios.post(`${API_URL}/logout`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // Remove the token from localStorage
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
