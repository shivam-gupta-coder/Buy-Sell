import React, { useState } from "react";
import Loginform from "../components/Loginform1";
import Signupform from "../components/Signupform1";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook for routing

const HomePage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <div className="home-page">
      <h1>Welcome to Dhandha@IIITH</h1>
      <div className="form-toggle">
        <button
          onClick={() => setIsLogin(true)}
          className={isLogin ? "active" : ""}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={!isLogin ? "active" : ""}
        >
          Signup
        </button>
      </div>

      <div className="form-container">
        {isLogin ? (
          <Loginform navigate={navigate} /> // Pass navigate prop to LoginForm
        ) : (
          <Signupform navigate={navigate} /> // Pass navigate prop to SignupForm
        )}
      </div>

      <style jsx>{`
        .home-page {
          text-align: center;
          margin: 20px;
        }
        .form-toggle {
          margin-bottom: 20px;
        }
        .form-toggle button {
          margin: 0 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
          font-size: 16px;
        }
        .form-toggle button.active {
          background-color: #0056b3;
        }
        .form-toggle button:not(.active):hover {
          background-color: #0056b3;
        }
        .form-container {
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
