import React from "react";
import { Link } from "react-router-dom";
import "../css/Sidebar.css"; // CSS for top navbar

const Sidebar = () => {
  return (
    <div className="navbar">
      <ul className="nav-links">
        {/* <li><Link to="/home">Home</Link></li> */}
        <li><Link to="/all-postals">All Postals</Link></li>
        <li><Link to="/post-postal">Post a Postal Stamp</Link></li>
        <li><Link to="/buy-postal">Buy a Postal Stamp</Link></li>
      </ul>
      <div className="account-icon">
        <Link to="/account">A</Link>
      </div>
    </div>
  );
};

export default Sidebar;
