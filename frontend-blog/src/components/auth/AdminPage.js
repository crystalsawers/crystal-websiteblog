import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const BASE_URL = 'http://localhost:3001/api/v1';

  // USE STATES
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState('');

  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedContent, setUpdatedContent] = useState('');
  const [updatedUser, setUpdatedUser] = useState('');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [updatedCategoryName, setUpdatedCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  const [selectedBlogPostId, setSelectedBlogPostId] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [updatedCommentContent, setUpdatedCommentContent] = useState('');

  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch initial data
    fetchBlogPosts();
    fetchCategories();
    fetchComments();
    fetchProfiles();
    fetchUsers();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/blogposts`);
      console.log(response.data);
      setBlogPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/profiles`);
      console.log(response.data);
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
      fetchBlogPosts(); // Update blog posts after creation
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
      fetchBlogPosts(); // Update blog posts after update
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
      fetchBlogPosts(); // Update blog posts after deletion
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  // COMMENTS
  // Create a comment
  const handleCreateComment = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/comments`, {
        content: updatedCommentContent,
        userId: user, // Assuming the user value represents the user ID
        postId: selectedBlogPostId, // Assuming selectedBlogPostId represents the selected blog post ID
      });

      console.log('Comment created:', response.data);

      setUpdatedCommentContent('');
      fetchComments(); // Update comments after creation
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  // Update a comment
  const handleUpdateComment = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${BASE_URL}/comments/${selectedCommentId}`, {
        content: updatedCommentContent,
      });

      console.log('Comment updated');

      setSelectedCommentId(null);
      setUpdatedCommentContent('');
      fetchComments(); // Update comments after update
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${BASE_URL}/comments/${commentId}`);

      console.log('Comment deleted');

      fetchComments(); // Update comments after deletion
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
      fetchCategories(); // Update categories after creation
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleSubmitCreateCategory = (e) => {
    e.preventDefault();
    handleCreateCategory(categoryName);
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/categories/${categoryId}`, {
        name: updatedCategoryName,
      });

      console.log('Category updated:', response.data);
      setUpdatedCategoryName('');
      fetchCategories(); // Update categories after update
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(`${BASE_URL}/categories/${categoryId}`);

      console.log('Category deleted');
      fetchCategories(); // Update categories after deletion
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div>
      <h2>Admin Page</h2>

      <h3>Blog Posts</h3>

      {/* Display blog posts if available */}

      {blogPosts.length > 0 ? (
        blogPosts.map((post) => (
          <div key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <p>User: {post.userId}</p>
            {/* Display any other blog post information */}
          </div>
        ))
      ) : (
        <p>No blog posts available.</p>
      )}

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
          <label htmlFor="categories">Categories:</label>
          {Array.isArray(categories) && categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
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
          <label htmlFor="categories">Categories:</label>
          {Array.isArray(categories) && categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </div>
        <button type="submit">Update</button>
      </form>

      <button onClick={handleDeleteBlogPost}>Delete Blog Post</button>

      <h3>Comments</h3>
      <form onSubmit={handleCreateComment}>
        <div>
          <label htmlFor="updatedCommentContent">Content:</label>
          <textarea
            id="updatedCommentContent"
            value={updatedCommentContent}
            onChange={(e) => setUpdatedCommentContent(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">Create Comment</button>
      </form>
      {Array.isArray(comments) && comments.map((comment) => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => handleDeleteComment(comment.id)}>
            Delete Comment
          </button>
        </div>
      ))}

      <h3>Categories</h3>
      <button onClick={handleSubmitCreateCategory}>Create Category</button>
      <form onSubmit={handleUpdateCategory}>
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

      <div>
        <label htmlFor="updatedCategoryName">Updated Category Name:</label>
        <input
          type="text"
          id="updatedCategoryName"
          value={updatedCategoryName}
          onChange={(e) => setUpdatedCategoryName(e.target.value)}
        />
      </div>
      <button onClick={handleUpdateCategory}>Update Category</button>

      <button onClick={handleDeleteCategory}>Delete Category</button>

      <h3>Profiles</h3>
      {/* Display profiles if available */}
      {Array.isArray(profiles) && profiles.length > 0 ? (
        profiles.map((profile) => (
          <div key={profile.id}>
            <h4>{profile.name}</h4>
            <p>Email: {profile.email}</p>
            {/* Display any other profile information */}
          </div>
        ))
      ) : (
        <p>No profiles available.</p>
      )}



      <h3>Users</h3>
      {/* Display users if available */}
      {Array.isArray(users.data) && users.data.length > 0 ? (
        users.data.map((user) => (
          <div key={user.id}>
            <h4>{user.name}</h4>
            <p>Email: {user.email}</p>
            {/* Display any other user information */}
          </div>
        ))
      ) : (
        <p>No users available.</p>
      )}

    </div>


  );


};

export default AdminPage;