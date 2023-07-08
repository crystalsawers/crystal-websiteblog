import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // Register API call
        await axios.post("http://localhost:3001/api/v1/auth/register", {
          name,
          username,
          email,
          password,
        });
        // Handle successful registration, e.g., display a success message to the user, redirect to login page, etc.
        setMessage("Registration successful");
        setIsSuccess(true);
      } else {
        // Login API call
        await axios.post("http://localhost:3001/api/v1/auth/login", {
          email,
          password,
        });
        // Handle successful login, e.g., store the token in localStorage, redirect the user, etc.
        setMessage("Login successful");
        setIsSuccess(true);
      }
    } catch (error) {
      // Handle login or registration error, e.g., display an error message to the user
      setMessage("Error: " + error.message);
      setIsSuccess(false);
    }
    // Reset the form fields
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    setMessage(""); // Clear the message when toggling between login and register
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      {message && <p className={isSuccess ? "success" : "error"}>{message}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>
        )}
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <button onClick={toggleRegister} className="toggle-button">
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Login;
