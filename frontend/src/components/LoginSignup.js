import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // For navigation
import "../css/LoginSignup.css";
import { AuthContext } from "../context/AuthContext";

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(""); // Clear error message when toggling forms
  };

  return (
    <div className="login-signup-container">
      <div className="form-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        {error && <p className="error">{error}</p>}
        {isLogin ? (
          <LoginForm setError={setError} />
        ) : (
          <SignupForm setError={setError} setIsLogin={setIsLogin} />  
        )}
        <p onClick={toggleForm} className="toggle-link">
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

const LoginForm = ({ setError }) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const navigate = useNavigate();  // Hook to navigate to home page
  const { login } = useContext(AuthContext)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", loginData);
      console.log("Login Successful:", response.data);
      login(response.data.user);
      setError(""); // Clear error if successful
      // Redirect to home page
      navigate("/all-postals");  // Go to Home page after successful login
    
    } catch (error) {
      console.error("Login Error:", error.response ? error.response.data : error.message);
      setError("Invalid credentials, please try again.");
    }
  };

  return (
    <form onSubmit={handleLoginSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={loginData.email}
        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

const SignupForm = ({ setError, setIsLogin }) => {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/signup", signupData);
      console.log("Signup Successful:", response.data);
      setError(""); // Clear error if successful
      // Switch to login form after successful signup
      setIsLogin(true);  // Switch to login
      
    } catch (error) {
      console.error("Signup Error:", error.response ? error.response.data : error.message);
      setError("Signup failed, please try again.");
    }
  };

  return (
    <form onSubmit={handleSignupSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={signupData.name}
        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={signupData.email}
        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={signupData.password}
        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default LoginSignup;
