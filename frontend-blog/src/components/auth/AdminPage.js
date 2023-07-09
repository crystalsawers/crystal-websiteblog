import React, { useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const BASE_URL = 'http://localhost:3001/api/v1';

  // USE STATES
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState('');

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
  const [categoryName, setCategoryName] = useState('');
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  // BLOG POSTS
  // Create a blog post
  const handleCreateBlogPost = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/blogposts`, {
        title: title,
        content: content,
        userId: user,
        categoryIds: selectedCategories,
      });

      console.log('Blog post created:', response.data);

      setTitle('');
      setContent('');
      setUser('');
      setSelectedCategories([]);
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
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${BASE_URL}/comments/${commentId}`);

      console.log('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // CATEGORY
  const renderCategoryOptions = () => {
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

  const handleCreateCategory = async (categoryName) => {
    try {
      const response = await axios.post(`${BASE_URL}/categories`, {
        name: categoryName,
      });

      console.log('Category created:', response.data);
      setCategoryName('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleSubmitCreateCategory = (e) => {
    e.preventDefault();
    handleCreateCategory(categoryName);
  };

  const handleUpdateCategory = async (categoryId, updatedName) => {
    try {
      const response = await axios.put(`${BASE_URL}/categories/${categoryId}`, {
        name: updatedName,
      });

      console.log('Category updated:', response.data);
      setUpdatedCategoryName('');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${BASE_URL}/categories/${categoryId}`);

      console.log('Category deleted');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
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
        <div>
          <label htmlFor="category">Categories:</label>
          <select
            id="category"
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, (option) => parseInt(option.value)))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
        <div>
          <label htmlFor="updatedCategory">Categories:</label>
          <select
            id="updatedCategory"
            multiple
            value={updatedCategories}
            onChange={(e) => setUpdatedCategories(Array.from(e.target.selectedOptions, (option) => parseInt(option.value)))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Update</button>
      </form>
      
      <button onClick={() => handleDeleteBlogPost(selectedBlogPostId)}>
        Delete Blog Post
      </button>

      <h3>Comments</h3>
      <button onClick={handleCreateComment}>Create Comment</button>
      <form onSubmit={handleUpdateComment}>
        <div>
          <label htmlFor="updatedCommentContent">Updated Content:</label>
          <textarea
            id="updatedCommentContent"
            value={updatedCommentContent}
            onChange={(e) => setUpdatedCommentContent(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">Update</button>
      </form>
      {comments.map((comment) => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => handleDeleteComment(comment.id)}>
            Delete Comment
          </button>
        </div>
      ))}

      <h3>Categories</h3>
      <button onClick={handleCreateCategory}>Create Category</button>
      <form onSubmit={handleSubmitCreateCategory}>
        <div>
          <label htmlFor="categoryName">Category Name:</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <button type="submit">Create</button>
      </form>

      <button onClick={() => handleUpdateCategory(categoryId, updatedCategoryName)}>
        Update Category
      </button>
      <div>
        <label htmlFor="updatedCategoryName">Updated Category Name:</label>
        <input
          type="text"
          id="updatedCategoryName"
          value={updatedCategoryName}
          onChange={(e) => setUpdatedCategoryName(e.target.value)}
        />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(categoryId, updatedCategoryName); }}>
        <button type="submit">Update</button>
      </form>

      <button onClick={() => handleDeleteCategory(categoryId)}>Delete</button>

      <h3>Profiles</h3>
      {/* Display all profiles, but no editing or deleting functionality */}

      <h3>Users</h3>
      {/* Display all users in the database */}
    </div>
  );

};

export default AdminPage;
