import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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
        console.log("Registration successful");
      } else {
        // Login API call
        await axios.post("http://localhost:3001/api/v1/auth/login", {
          email,
          password,
        });
        // Handle successful login, e.g., store the token in localStorage, redirect the user, etc.
        console.log("Login successful");
      }
    } catch (error) {
      // Handle login or registration error, e.g., display an error message to the user
      console.error("Error:", error.message);
    }
    // Reset the form fields
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        {isRegistering && (
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
      </form>
      <button onClick={toggleRegister}>
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Login;
