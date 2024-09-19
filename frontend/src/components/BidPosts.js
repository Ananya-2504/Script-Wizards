import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming you have user context
import "../css/Posts.css"; // You can add CSS for styling the posts

const BidPosts = () => {
  const { user } = useContext(AuthContext); // Get the logged-in user info
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/bidPosts/${user.userId}`);
        console.log("Response:", response.data);
        setPosts(response.data); // Assuming the backend sends an array of posts
      } catch (err) {
        setError("Error fetching posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user.userId]);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="posts-container">
      <div className="all">
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post.postId} className="post-card">
              <h2>{post.title}</h2>
              {/* Render image if exists */}
              {post.postData.image && (
                <div className="post-image">
                  <img src={post.postData.image} alt={post.title} />
                </div>
              )}
              <p><strong>Description:</strong> {post.postData.description}</p>
              <p><strong>City:</strong> {post.postData.locationInfo.city}</p>
              <p><strong>State:</strong> {post.postData.locationInfo.state}</p>
              <p><strong>Date:</strong> {post.postData.date}</p>
              <p><strong>Author:</strong> {post.postData.author}</p>
              <p><strong>Bid amount:</strong> {post.postData.bidAmount}</p>

              {post.postData.lastBiddedUser && (
                <p><strong>Last Bid By:</strong> {post.postData.lastBiddedUser}</p>
              )}

              {/* display your bid field */}
              {post.bidData.userBid ? (
                <p><strong>Your Bid:</strong> Rs.{post.bidData.userBid}</p>
              ) : (
                <p>No bid placed yet.</p>
              )}
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BidPosts;
