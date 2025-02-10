import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import SearchItems from "./Pages/SearchItems";
import Itemdets from "./Pages/Itemdets";
import SellPage from "./Pages/SellPage";
import Cart from "./Pages/Cart";
import OrderHistory from "./Pages/Orders"; // Import the new component
import { AuthProvider } from './context/AuthContext';
import DeliverItems from './Pages/Deliver';
import Chatbot from "./Pages/Chatbot";
function App() {
  // Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  return (
   
      <Router>
        <Navbar title="Dhandha@IIITH" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={ <Dashboard /> } />
          <Route path="/search-items" element={ <SearchItems /> } />
          <Route path="/productDetails/:id" element={ <Itemdets />  } />
          <Route path="/my-cart" element={ <Cart /> } />
          <Route path="/order-history" element={ <OrderHistory /> }/>
          <Route path="/sellPage" element={<SellPage /> } />
          <Route path="/deliveritems" element={<DeliverItems /> } />
          <Route path="/chatbot" element={<Chatbot />} />
          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

  );
}

export default App;
