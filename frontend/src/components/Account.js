import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Posts from "./Posts";
import BidPosts from "./BidPosts"; // Import the new component

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const [showPosts, setShowPosts] = useState(false);
  const [showBidPosts, setShowBidPosts] = useState(false);
  const navigate = useNavigate();

  const handleViewPosts = () => {
    setShowPosts((prev) => !prev);
  };

  const handleViewBidPosts = () => {
    setShowBidPosts((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect after logout
  };

  return (
    <div>
      <h1>Account</h1>
      <p>Manage your account information here.</p>

      <button onClick={handleViewPosts}>
        {showPosts ? "Hide My Posts" : "View My Posts"}
      </button>

      {showPosts && <Posts />}

      <button onClick={handleViewBidPosts} style={{ marginTop: "20px" }}>
        {showBidPosts ? "Hide My Bids" : "View Posts I Bid On"}
      </button>

      {showBidPosts && <BidPosts />} {/* Render the BidPosts component */}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default Account;
