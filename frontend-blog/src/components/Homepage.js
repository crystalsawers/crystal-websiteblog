import React, { useState, useEffect } from "react";
import axios from "axios";

const Homepage = () => {
  const [recentBlogPosts, setRecentBlogPosts] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch recent blog posts and users
  useEffect(() => {
    const fetchRecentData = async () => {
            const BASE_URL = "http://localhost:3001/api/v1";
            // const BASE_URL = process.env.REACT_APP_BACKEND_URL + "/api/v1";
      try {
        // Fetch recent blog posts
        const blogPostsResponse = await axios.get(
          `${BASE_URL}/blogposts?limit=5`
        );
        const blogPostsData = blogPostsResponse.data.data;
        setRecentBlogPosts(blogPostsData);

        // Fetch users
        const usersResponse = await axios.get(`${BASE_URL}/users`);
        const usersData = usersResponse.data.data;
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching recent data:", error);
      }
    };

    fetchRecentData();
  }, []);

  return (
    <div>
      <h2>Recent Blog Post:</h2>
      {recentBlogPosts.length > 0 ? (
        <ul>
          {recentBlogPosts.map((blogPost) => (
            <li key={blogPost.id}>
              <h3>{blogPost.title}</h3>
              <p>{blogPost.content}</p>
              <h4>Comments:</h4>
              {blogPost.comments.length > 0 ? (
                <ul>
                  {blogPost.comments.map((comment) => {
                    const user = users.find((user) => user.id === comment.userId);
                    const username = user ? user.username : "Unknown User";

                    return (
                      <li key={comment.id}>
                        {comment.content} User: {username}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No comments for this blog post.</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent blog posts found.</p>
      )}
    </div>
  );
};

export default Homepage;
