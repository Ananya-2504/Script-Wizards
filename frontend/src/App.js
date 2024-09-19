import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./components/LoginSignup";
import Home from "./components/Home";
import AllPostals from "./components/AllPostals";
import PostPostalStamp from "./components/PostPostalStamp";
import BuyPostalStamp from "./components/BuyPostalStamp";
import Account from "./components/Account";
import Sidebar from "./components/Sidebar";
import "./css/App.css";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route for Login/Signup page */}
          <Route path="/" element={<LoginSignup />} />
          {/* Routes for the pages after login with top navbar */}
          {/* <Route path="/home" element={<WithNavbar><Home /></WithNavbar>} /> */}
          <Route path="/all-postals" element={<WithNavbar><AllPostals /></WithNavbar>} />
          <Route path="/post-postal" element={<WithNavbar><PostPostalStamp /></WithNavbar>} />
          <Route path="/buy-postal" element={<WithNavbar><BuyPostalStamp /></WithNavbar>} />
          <Route path="/account" element={<WithNavbar><Account /></WithNavbar>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Higher-order component to include the Navbar
const WithNavbar = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <div className="content-container">
        {children}
      </div>
    </div>
  );
};

export default App;
