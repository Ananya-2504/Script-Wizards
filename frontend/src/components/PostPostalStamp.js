import React, { useState, useContext } from "react";
import axios from "axios";
import "../css/PostPostalStamp.css";
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";  // For navigation

const PostPostalStamp = () => {
  const { user } = useContext(AuthContext);
  const [base64, setBase64] = useState(""); // State to hold base64 string
  const navigate = useNavigate(); 

  // State to hold form input data
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    city: "",
    state: "",
    description: "",
    author: "",
    image: "", // This will store the base64 image
    userId: "", // User ID from context
    bidAmount: 0
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image input change and convert it to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result);  // Set the base64 string
        setFormData((prevData) => ({
          ...prevData,
          image: reader.result, // Save base64 string to formData.image
        }));
      };
      reader.readAsDataURL(file); // Convert image file to base64
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
    if (!user || !user.userId) {
      // setError("User not found. Please log in.");
      // setLoading(false);
      return;
    }

    if(user){
      // setError("");
      // setLoading(true);
      formData.userId = user.userId;
    }
    try {
      // change the date to the format 17th september 2024
      const date = new Date(formData.date);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      formData.date = date.toLocaleDateString('en-US', options);
      const response = await axios.post("http://localhost:5000/post-postal", formData, {
        headers: {
          "Content-Type": "application/json", // Set headers for JSON
        },
      });
      console.log("Postal stamp submitted successfully:", response.data);
      alert("Postal stamp submitted successfully!");
      // naviage to account page
      navigate("/account");
    } catch (error) {
      console.error("Error submitting postal stamp:", error.response ? error.response.data : error.message);
      alert("Error submitting postal stamp. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1>Post a Postal Stamp</h1>
      <form onSubmit={handleSubmit} className="postal-form">
        {/* Title */}
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Date */}
        {/* make sure the date is before the current date */}
        {/* <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div> */}
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            pattern="\d{2}-\d{2}-\d{4}"
            required
            className="input-field"
          />
        </div>

        {/* City */}
        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* State */}
        <div className="form-group">
          <label>State:</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="textarea-field"
          />
        </div>

        {/* Author */}
        <div className="form-group">
          <label>Author:</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* bidamount */}
        <div className="form-group">
          <label>Bid Amount:</label>
          <input
            type="number"
            name="bidAmount"
            value={formData.bidAmount}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        {/* Image Upload */}
        <div className="form-group">
          <label>Upload Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="image-upload"
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="submit-button">Submit Postal Stamp</button>
      </form>
    </div>
  );
};

export default PostPostalStamp;
