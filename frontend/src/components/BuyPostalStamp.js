import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming you have user context
import "../css/Posts.css"; // Use the same CSS for consistent styling

const BuyPostalStamp = () => {
  const { user } = useContext(AuthContext); // Get the logged-in user info
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    startDate: "",
    endDate: "",
    showMyBid: false
  });

  // State for bidding
  const [biddingPostId, setBiddingPostId] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState(""); // New state for error message

  // Fetch all postal posts from the backend
  useEffect(() => {
    if (!user || !user.userId) {
      setLoading(true);
      return;
    }

    const fetchAllPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/all-posts/${user.userId}`);
        console.log("All posts:", response.data);
        setPosts(response.data); // Assuming the backend sends an array of all posts
      } catch (err) {
        console.error("Error fetching all posts", err);
        setError("Error fetching all posts");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [user]);

  // Function to handle the input of the search query
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Function to handle filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Function to filter posts based on search query and filter options
  const filteredPosts = posts.filter((post) => {
    // Filter by search query
    const matchesSearch = post.title.toLowerCase().includes(searchQuery) ||
      post.postData.description.toLowerCase().includes(searchQuery);

    // Filter by city and state
    const matchesCity = filters.city ? post.postData.locationInfo.city.toLowerCase() === filters.city.toLowerCase() : true;
    const matchesState = filters.state ? post.postData.locationInfo.state.toLowerCase() === filters.state.toLowerCase() : true;

    // Filter by date range
    const postDate = new Date(post.postData.date);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    const matchesDate = (!startDate || postDate >= startDate) && (!endDate || postDate <= endDate);

    // Filter by showMyBid
    const matchesMyBid = filters.showMyBid ? post.bidData.userBid : true;

    return matchesSearch && matchesCity && matchesState && matchesDate && matchesMyBid;
  });

  // Function to handle bidding
  const handleBid = (postId) => {
    // find the post by postId in the document
    // if the user has already placed a bid on the post, show the bid amount in the bidAmount field
    // else show the current bid amount in the bidAmount field

    setBiddingPostId(postId);
    setBidAmount(""); // Clear previous bid amount
    setBidError("");  // Clear previous error message
  };

  const submitBid = async () => {
    if (!biddingPostId || !bidAmount) {
      setBidError("Please enter a bid amount."); // Show error if no bid amount
      return;
    }

    const post = posts.find(p => p.postId === biddingPostId);
    if (!post) {
      setBidError("Post not found.");
      return;
    }

    const currentBidAmount = post.postData.bidAmount ? post.postData.bidAmount : 0;

    if (parseFloat(bidAmount) <= currentBidAmount) {
      setBidError("Bid amount must be greater than the current bid."); // Show validation error
      return;
    }

    try {
      await axios.post("http://localhost:5000/place-bid", {
        postId: biddingPostId,
        bidAmount: bidAmount,
        userId: user.userId
      });
      alert("Bid placed successfully!");
      setBiddingPostId(null);
      setBidAmount("");
      setBidError(""); // Clear the error after successful submission
      // refresh the page to show the updated bid amount
      window.location.reload();
    } catch (err) {
      console.error("Error placing bid", err);
      setBidError("Error placing bid. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading postal posts...</p>;
  }

  return (
    <div className="posts-container">
      <h1>Buy a Postal Stamp</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by title, description"
        value={searchQuery}
        onChange={handleSearchInput}
        className="search-input"
      />

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          name="city"
          placeholder="Filter by City"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="state"
          placeholder="Filter by State"
          value={filters.state}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        {/* add a filter to show the posts that the user bidded only */}
        <label>
          <input
            type="checkbox"
            name="showMyBid"
            checked={filters.showMyBid}
            onChange={() => setFilters({ ...filters, showMyBid: !filters.showMyBid })}
          />
          Show my bids
        </label>

      </div>

      <div className="all">
        {filteredPosts.length === 0 ? (
          <p>No postal stamps found.</p>
        ) : (
          filteredPosts.map((post) => (
            <div className="post-card" key={post.postId}>
              {post.postData.image && (
                <div className="post-image">
                  <img src={post.postData.image} alt={post.title} />
                </div>
              )}
              <h2>{post.title}</h2>
              <p><strong>Description:</strong> {post.postData.description}</p>
              <p><strong>City:</strong> {post.postData.locationInfo.city}</p>
              <p><strong>State:</strong> {post.postData.locationInfo.state}</p>
              <p><strong>Date:</strong> {post.postData.date}</p>
              <p><strong>Author:</strong> {post.postData.author}</p>
              {post.postData.userName && (
                <p><strong>User Name:</strong> {post.postData.userName}</p>
              )}

              {/* Display current bid info */}
              {post.postData.bidAmount && (
                <p><strong>Current Bid:</strong> Rs.{post.postData.bidAmount}</p>
              )}

              {post.postData.lastBiddedUser && (
                <p><strong>Last Bid By:</strong> {post.postData.lastBiddedUser}</p>
              )}

              {/* display your bid field */}
              {post.bidData.userBid ? (
                <p><strong>Your Bid:</strong> Rs.{post.bidData.userBid}</p>
              ) : (
                <p>No bid placed yet.</p>
              )}

              {/* Conditionally render the button and the bid form */}
              {biddingPostId === post.postId ? (
                <div className="bid-form">
                  <input
                    type="number"
                    placeholder="Enter your bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  {bidError && <p className="error">{bidError}</p>} {/* Display validation error */}
                  <button onClick={submitBid}>Submit Bid</button>
                </div>
              ) : (
                <button onClick={() => handleBid(post.postId)}>Place Bid</button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default BuyPostalStamp;
