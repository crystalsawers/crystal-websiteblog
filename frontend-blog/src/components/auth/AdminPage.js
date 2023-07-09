import React, { useState } from 'react';
import axios from 'axios';


const AdminPage = () => {

  const BASE_URL = "http://localhost:3001/api/v1";

  // USE STATES
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState("");

  const [updatedTitle, setUpdatedTitle] = useState(
    selectedBlogPost ? selectedBlogPost.title : ''
  );
  const [updatedContent, setUpdatedContent] = useState(
    selectedBlogPost ? selectedBlogPost.content : ''
  );
  const [updatedUser, setUpdatedUser] = useState(
    selectedBlogPost ? selectedBlogPost.user : ''
  );


  // BLOG POSTS 
  const handleCreateBlogPost = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/blogposts`, {
        title,
        content,
        user,
      });

      console.log("Blog post created:", response.data);
      setTitle("");
      setContent("");
      setUser("");
    } catch (error) {
      console.error("Error creating blog post:", error);
    }
  };
  
  const [selectedBlogPostId, setSelectedBlogPostId] = useState(null);


  const handleUpdateBlogPost = async (e) => {
    e.preventDefault();

    try {
      if (selectedBlogPostId) {
        // Retrieve the selected blog post based on the selectedBlogPostId
        const selectedBlogPost = blogPosts.find(
          (blogPost) => blogPost.id === selectedBlogPostId
        );

        if (selectedBlogPost) {
          const response = await axios.put(
            `${BASE_URL}/blogposts/${selectedBlogPost.id}`,
            {
              title: updatedTitle,
              content: updatedContent,
              user: updatedUser,
            }
          );

          console.log("Blog post updated:", response.data);
          setUpdatedTitle("");
          setUpdatedContent("");
          setUpdatedUser("");
          setSelectedBlogPostId(null); // Reset the selected ID after updating
        } else {
          // Handle the case where the selected blog post is not found
          console.log("Selected blog post not found.");
        }
      } else {
        // Handle the case where no blog post is selected for update
        console.log("Please select a blog post to update.");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      // Handle error state or display an error message to the user
    }
  };



  const handleDeleteBlogPost = async () => {
    try {
      if (selectedBlogPostId) {
        await deleteBlogPost(selectedBlogPostId);
        console.log('Blog post deleted');
      } else {
        console.log('Please select a blog post to delete.');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const deleteBlogPost = async (blogPostId) => {
    await axios.delete(`${BASE_URL}/blogposts/${blogPostId}`);
  };





  // COMMENTS
  const handleCreateComment = async (commentContent, blogPostId, userId) => {
    try {
      // Perform the API call or database operation to create the comment
      const response = await axios.post(`${BASE_URL}/comments`, {
        content: commentContent,
        blogPostId: blogPostId,
        userId: userId,
      });
  
      // Handle the response and update the UI as needed
      console.log('Comment created:', response.data);
  
      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      // Handle error state or display an error message to the user
      console.error('Error creating comment:', error);
    }
  };
  

  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      // Perform the API call or database operation to update the comment
      const response = await axios.put(`${BASE_URL}/comments/${commentId}`, {
        content: updatedContent,
      });
  
      // Handle the response and update the UI as needed
      console.log('Comment updated:', response.data);
  
      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      // Handle error state or display an error message to the user
      console.error('Error updating comment:', error);
    }
  };
  

  const handleDeleteComment = async (commentId) => {
    try {
      // Perform the API call or database operation to delete the comment
      await axios.delete(`${BASE_URL}/comments/${commentId}`);
  
      // Handle the response and update the UI as needed
      console.log('Comment deleted');
  
      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      // Handle error state or display an error message to the user
      console.error('Error deleting comment:', error);
    }
  };
  



  // CATEGORY
  const handleCreateCategory = () => {
    // Logic to create a category
  };

  const handleUpdateCategory = () => {
    // Logic to update a category
  };

  const handleDeleteCategory = () => {
    // Logic to delete a category
  };

  return (
    <div>
      <h2>Admin Page</h2>

      <h3>Blog Posts</h3>

      <h3>Create Blog Post</h3>
      <form onSubmit={handleCreateBlogPost}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="user">User:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>


      <h3>Update Blog Post</h3>
      <form onSubmit={handleUpdateBlogPost}>
        <div>
          <label htmlFor="updatedTitle">Title:</label>
          <input
            type="text"
            id="updatedTitle"
            value={updatedTitle}
            onChange={(e) => setUpdatedTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="updatedContent">Content:</label>
          <textarea
            id="updatedContent"
            value={updatedContent}
            onChange={(e) => setUpdatedContent(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="updatedUser">User:</label>
          <input
            type="text"
            id="updatedUser"
            value={updatedUser}
            onChange={(e) => setUpdatedUser(e.target.value)}
          />
        </div>
        <button type="submit">Update</button>
      </form>



      <button onClick={() => handleDeleteBlogPost(selectedBlogPostId)}>
        Delete Blog Post
      </button>


      <h3>Comments</h3>
      <button onClick={handleCreateComment}>Create Comment</button>
      <button onClick={handleUpdateComment}>Update Comment</button>
      <button onClick={handleDeleteComment}>Delete Comment</button>

      <h3>Categories</h3>
      <button onClick={handleCreateCategory}>Create Category</button>
      <button onClick={handleUpdateCategory}>Update Category</button>
      <button onClick={handleDeleteCategory}>Delete Category</button>

      <h3>Profiles</h3>
      {/* Display all profiles, but no editing or deleting functionality */}

      <h3>Users</h3>
      {/* Display all users in the database */}
    </div>
  );
};




export default AdminPage;
