import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming you have user context
import "../css/Posts.css"; // You can add CSS for styling the posts

const Posts = () => {
  const { user } = useContext(AuthContext); // Get the logged-in user info
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/posts/${user.userId}`);
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

  // Function to mark bidding as complete
  const completeBidding = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/complete-bidding`, { postId });
      alert("Bidding completed successfully!");
      // Optionally, refresh the posts list or update the specific post state
      window.location.reload();
    } catch (err) {
      console.error("Error completing bidding", err);
      alert("Error completing bidding. Please try again.");
    }
  };

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
              
              {/* Complete Bidding Button */}
              {post.postData.biddingCompleted === true ? (
                <p>Bidding Completed</p>
              ) : (
                <button onClick={() => completeBidding(post.postId)}>Complete Bidding</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
