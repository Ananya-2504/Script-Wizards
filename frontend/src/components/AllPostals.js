import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming you have user context
import "../css/Posts.css"; // Use the same CSS for consistent styling

const AllPostals = () => {
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
  });

  // Fetch all postal posts from the backend
  useEffect(() => {
    if (!user || !user.userId) {
      setLoading(true);
      return;
    }

    const fetchAllPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/all-posts/${user.userId}`);
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

    return matchesSearch && matchesCity && matchesState && matchesDate;
  });

  if (loading) {
    return <p>Loading postal posts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="posts-container">
      <h1>All Postal Stamps</h1>

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
      </div>

      {/* Display filtered posts */}
      <div class="all">
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
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default AllPostals;
