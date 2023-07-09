import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

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

import slugify from "slugify";

// Function to generate a slug based on a given string
const generateSlug = (str) => {
  return slugify(str, { lower: true });
};


// Define CategoryPage component
const CategoryPage = ({ category, relatedBlogPosts }) => {
  return (
    <div>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <h4>Blog Posts:</h4>
      {Array.isArray(relatedBlogPosts?.data) && relatedBlogPosts.data.length > 0 ? (
        <ul>
          {relatedBlogPosts.data.map((blogPost) => (
            <li key={blogPost.id}>
              <h5>{blogPost.title}</h5>
              <p>{blogPost.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No blog posts in this category.</p>
      )}
    </div>
  );
};

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const navbar = { backgroundColor: "#189BCC" };

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [relatedBlogPosts, setRelatedBlogPosts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/v1/categories");
        const responseData = response.data;
    
        if (Array.isArray(responseData.data) && responseData.data.length > 0) {
          const categoriesWithSlug = responseData.data.map((category) => ({
            ...category,
            slug: generateSlug(category.name), // Generate the slug based on category name
          }));
          setCategories(categoriesWithSlug);
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
      const categoryResponse = await axios.get(
        `http://localhost:3001/api/v1/categories/${categoryId}`
      );
      const categoryData = categoryResponse.data;

      const blogPostsResponse = await axios.get(
        `http://localhost:3001/api/v1/blogposts?category=${categoryId}`
      );
      const blogPostsData = blogPostsResponse.data;

      setSelectedCategory(categoryData);
      setRelatedBlogPosts(blogPostsData || []);
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
                    tag={Link}
                    to={`/${category.slug}`}
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
              <NavLink tag={Link} to="/login">
                Login/Register
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Routes>
        <Route path="/login" element={<Login />} />
        {categories.map((category) => (
          <Route
            key={category.id}
            path={`/${category.slug}`}
            element={<CategoryPage category={category} relatedBlogPosts={relatedBlogPosts} />}
          />
        ))}
      </Routes>
      {selectedCategory && (
        <div>
          <h3>{selectedCategory.name}</h3>
          <p>{selectedCategory.description}</p>
          <h4>Blog Posts:</h4>
          {Array.isArray(relatedBlogPosts?.data) && relatedBlogPosts.data.length > 0 ? (
            <ul>
              {relatedBlogPosts.data.map((blogPost) => (
                <li key={blogPost.id}>
                  <h5>{blogPost.title}</h5>
                  <p>{blogPost.content}</p>
                </li>
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
