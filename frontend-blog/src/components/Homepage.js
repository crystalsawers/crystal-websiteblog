import React, { useState, useEffect } from "react";
import axios from "axios";

const Homepage = () => {
    const [recentBlogPosts, setRecentBlogPosts] = useState([]);
    const [comments, setComments] = useState([]);
  
    // Fetch recent blog posts and comments
    useEffect(() => {
      const fetchRecentData = async () => {
        try {
          // Fetch recent blog posts
          const blogPostsResponse = await axios.get(
            "http://localhost:3001/api/v1/blogposts?limit=5"
          );
          const blogPostsData = blogPostsResponse.data.data;
          setRecentBlogPosts(blogPostsData);
  
          // Fetch comments related to the recent blog posts
          const commentsResponse = await axios.get(
            "http://localhost:3001/api/v1/comments?limit=5"
          );
          const commentsData = commentsResponse.data.data;
          setComments(commentsData);
        } catch (error) {
          console.error("Error fetching recent data:", error);
        }
      };
  
      fetchRecentData();
    }, []);
  
    return (
      <div>
        <h2>Recent Blog Posts:</h2>
        {recentBlogPosts.length > 0 ? (
          <ul>
            {recentBlogPosts.map((blogPost) => (
              <li key={blogPost.id}>
                <h3>{blogPost.title}</h3>
                <p>{blogPost.content}</p>
                <h4>Comments:</h4>
                <ul>
                  {comments
                    .filter((comment) => comment.blogPostId === blogPost.id)
                    .map((comment) => (
                      <li key={comment.id}>{comment.text}</li>
                    ))}
                </ul>
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
  