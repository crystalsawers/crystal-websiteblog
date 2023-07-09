import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../styling/Login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const BASE_URL = "http://localhost:3001/api/v1/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // Register API call
        await axios.post(`${BASE_URL}/register`, {
          name,
          email,
          username,
          password,
        });
        // Handle successful registration
        setMessage("Registration successful");
        setIsSuccess(true);
      } else {
        // Login API call
        const response = await axios.post(`${BASE_URL}/login`, {
          username,
          password,
        });
        // Handle successful login
        Cookies.set("token", response.data.token, { expires: 1 });
        console.log(response.data.msg);
        setMessage("Login successful");
        setIsSuccess(true);
      }
    } catch (error) {
      // Handle login or registration error
      setMessage("Error: " + error.message);
      setIsSuccess(false);
    }
    // Reset the form fields
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    setMessage("");
  };

  const handleLogout = () => {
    Cookies.remove("token");
  };

  const isLoggedIn = () => {
    return !!Cookies.get("token");
  };

  return (
    <div className="login-container">
      {isLoggedIn() ? (
        <>
          <h2>Welcome, {username}!</h2>
          {/* Additional content for the logged-in user */}
        </>
      ) : (
        <>
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
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            {!isRegistering && (
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
        </>
      )}
    </div>
  );
};

export default Login;
