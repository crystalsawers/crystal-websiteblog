import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import Login from "./Login";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const navbar = { backgroundColor: "#189BCC" };

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [relatedBlogPosts, setRelatedBlogPosts] = useState([]);

  // Fetch categories data from API and populate the state
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/v1/categories");
        const responseData = response.data;

        if (Array.isArray(responseData.data) && responseData.data.length > 0) {
          setCategories(responseData.data);
        } else {
          console.error("Invalid categories data:", responseData);
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    try {
      // Fetch category description
      const categoryResponse = await axios.get(
        `http://localhost:3001/api/v1/categories/${categoryId}`
      );
      const categoryData = categoryResponse.data;

      // Fetch related blog posts
      const blogPostsResponse = await axios.get(
        `http://localhost:3001/api/v1/blogposts?category=${categoryId}`
      );
      const blogPostsData = blogPostsResponse.data;

      setSelectedCategory(categoryData);
      setRelatedBlogPosts(blogPostsData || []); // Set to empty array if blogPostsData is falsy
    } catch (error) {
      console.error("Error fetching category information:", error);
    }
  };

  return (
    <Router>
      <Navbar style={navbar} expand="md" dark>
        <NavbarBrand href="/">Crystal's blog</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ms-auto" navbar>
            {categories.length > 0 ? (
              categories.map((category) => (
                <NavItem key={category.id}>
                  <NavLink
                    href="#"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    {category.name}
                  </NavLink>
                </NavItem>
              ))
            ) : (
              <NavItem>
                <NavLink>Loading Categories...</NavLink>
              </NavItem>
            )}
            <NavItem>
              <NavLink href="/login">Login/Register</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
      {selectedCategory && (
        <div>
          <h3>{selectedCategory.name}</h3>
          <p>{selectedCategory.description}</p>
          <h4>Blog Posts:</h4>
          {Array.isArray(relatedBlogPosts) ? (
            <ul>
              {relatedBlogPosts.map((blogPost) => (
                <li key={blogPost.id}>{blogPost.title}</li>
              ))}
            </ul>
          ) : (
            <p>No blog posts in this category.</p>
          )}
        </div>
      )}
    </Router>
  );
};

export default Navigation;
