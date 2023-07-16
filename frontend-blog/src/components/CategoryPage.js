import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryPage = ({ category, blogPosts }) => {
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchCommentsAndUsers = async () => {

      const BASE_URL = "http://localhost:3001/api/v1";
      // const BASE_URL = process.env.REACT_APP_BACKEND_URL + "/api/v1";

      try {
        const blogPostIds = blogPosts.map((post) => post.id);
        const commentsResponse = await axios.get(
          `${BASE_URL}/comments?postId=${blogPostIds.join(",")}`
        );
        const commentsData = commentsResponse.data.data;

        if (Array.isArray(commentsData) && commentsData.length > 0) {
          setComments(commentsData);
          const userIds = commentsData.map((comment) => comment.userId);
          const usersResponse = await axios.get(
            `${BASE_URL}/users?userId=${userIds.join(",")}`
          );
          const usersData = usersResponse.data.data;
          if (Array.isArray(usersData) && usersData.length > 0) {
            setUsers(usersData);
          } else {
            setUsers([]);
          }
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments and users:", error.message);
      }
    };

    fetchCommentsAndUsers();
  }, [blogPosts]);

  const filteredBlogPosts = blogPosts.filter((post) =>
    post.categories.some((cat) => cat.id === category.id)
  );

  return (
    <div>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      {filteredBlogPosts.length > 0 ? (
        <>
          <h4>Blog Posts:</h4>
          <ul>
            {filteredBlogPosts.map((blogPost) => {
              const blogPostComments = comments.filter(
                (comment) => comment.postId === blogPost.id
              );
              return (
                <li key={blogPost.id}>
                  <h5>{blogPost.title}</h5>
                  <p>{blogPost.content}</p>
                  <h4>Comments:</h4>
                  {blogPostComments.length > 0 ? (
                    <ul>
                      {blogPostComments.map((comment) => {
                        const user = users.find(
                          (user) => user.id === comment.userId
                        );
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
              );
            })}
          </ul>
        </>
      ) : (
        <p>No blog posts in this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;
