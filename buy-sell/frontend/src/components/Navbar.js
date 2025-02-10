import React from "react";
import { Link } from "react-router-dom";
// import "./Navbar.css";

export default function Navbar(props) {
  // Handle Logout
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Optionally, redirect the user to the home page
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          {props.title}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sellPage">
                Sell Item
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-items">
                Search Items
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-cart">
                My Cart
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/order-history">
                Order History
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/deliveritems">
                Deliver Items
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/chatbot">
                Support
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
