import React from "react";
import axios from "axios";
// import { useEffect, useState } from "react";

const UserProfile = ({ isLoggedIn }) => {

  const BASE_URL = process.env.REACT_APP_BACKEND_URL + "/api/v1";
  // const BASE_URL = "http://localhost:3001/api/v1";

  const handleCreateProfile = async () => {
    const bio = "Sample bio"; // Example: Retrieve the bio from user input or form field
    const avatar = "sample-avatar-url"; // Example: Retrieve the avatar from user input or form field
    const user = { id: 123 }; // Example: Retrieve the user object from user authentication or state
    try {
      const profileData = {
        bio: bio, // Retrieve the bio from user input or form field
        avatar: avatar, // Retrieve the avatar from user input or form field
        userId: user.id, // Assuming the user object contains the user ID
      };

      const response = await axios.post(`${BASE_URL}/profiles`, profileData);
      console.log("Profile created:", response.data);

      // Add any additional logic or update the UI as needed
    } catch (error) {
      console.error("Error creating profile:", error.message);
      // Handle the error and display an error message or perform any other necessary action
    }
  };

  const handleUpdateProfile = () => {
    // Implement logic to update a user profile using Axios
    // For example, you can make a PUT request to the backend API

    const updatedProfileData = {
      // Include the updated data for the user profile
      // For example: updated name, bio, profile picture, etc.
    };

    axios
      .put("/api/profile", updatedProfileData)
      .then((response) => {
        // Handle successful profile update
        console.log("Profile updated:", response.data);
        // Add any additional logic or update the UI as needed
      })
      .catch((error) => {
        // Handle profile update error
        console.error("Error updating profile:", error.message);
        // Handle the error and display an error message or perform any other necessary action
      });
  };

  return (
    <>
      <div className="user-profile">
        <p>Welcome, user !</p>
        <p>This is your user profile.</p>
        <p>Here, you can create and update your profile.</p>
        <button onClick={handleCreateProfile}>Create Profile</button>
        <button onClick={handleUpdateProfile}>Update Profile</button>
      </div>
    </>
  );
};

export default UserProfile;
