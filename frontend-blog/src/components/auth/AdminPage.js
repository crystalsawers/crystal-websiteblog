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

  const [selectedCategories, setSelectedCategories] = useState([]);

  // BLOG POSTS 
  // Create a blog post
const handleCreateBlogPost = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(`${BASE_URL}/blogposts`, {
      title: title,
      content: content,
      userId: user, // Assuming the user value represents the user ID
      categoryIds: selectedCategories, // Pass the selected category IDs
    });

    console.log('Blog post created:', response.data);

    // Optionally, update the list of blog posts or perform any other necessary actions
    setTitle('');
    setContent('');
    setUser('');
    setSelectedCategories([]); // Reset selected categories
  } catch (error) {
    console.error('Error creating blog post:', error);
  }
};

  // Update a blog post
  const handleUpdateBlogPost = async (e) => {
    e.preventDefault();
  
    try {
      await axios.put(`${BASE_URL}/blogposts/${selectedBlogPostId}`, {
        title: updatedTitle,
        content: updatedContent,
      });
  
      console.log('Blog post updated');
  
      // Optionally, update the list of blog posts or perform any other necessary actions
      setUpdatedTitle('');
      setUpdatedContent('');
      setUpdatedUser('');
      setSelectedBlogPostId(null);
    } catch (error) {
      console.error('Error updating blog post:', error);
    }
  };
  

  // Delete a blog post
  const handleDeleteBlogPost = async () => {
    try {
      await axios.delete(`${BASE_URL}/blogposts/${selectedBlogPostId}`);
  
      console.log('Blog post deleted');
  
      // Optionally, update the list of blog posts or perform any other necessary actions
      setSelectedBlogPostId(null);
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };
  

  // COMMENTS
  // Create a comment
  const handleCreateComment = async (commentContent, userId, postId) => {
    try {
      const response = await axios.post(`${BASE_URL}/comments`, {
        content: commentContent,
        userId: userId,
        postId: postId,
      });

      console.log('Comment created:', response.data);

      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  // Update a comment
  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      const response = await axios.put(`${BASE_URL}/comments/${commentId}`, {
        content: updatedContent,
      });

      console.log('Comment updated:', response.data);

      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${BASE_URL}/comments/${commentId}`);

      console.log('Comment deleted');

      // Optionally, update the list of comments or perform any other necessary actions
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };


// Example category selection UI
const renderCategoryOptions = () => {
  // Assuming you have a categories state variable containing the list of categories
  return categories.map((category) => (
    <label key={category.id}>
      <input
        type="checkbox"
        value={category.id}
        checked={selectedCategories.includes(category.id)}
        onChange={handleCategoryChange}
      />
      {category.name}
    </label>
  ));
};

const handleCategoryChange = (e) => {
  const categoryId = parseInt(e.target.value);
  if (e.target.checked) {
    setSelectedCategories([...selectedCategories, categoryId]);
  } else {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
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
