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
import Homepage from "./Homepage";

import slugify from "slugify";

// Function to generate a slug based on a given string
const generateSlug = (str) => {
  return slugify(str, { lower: true });
};

const CategoryPage = ({ category, blogPosts }) => {
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
            {filteredBlogPosts.map((blogPost) => (
              <li key={blogPost.id}>
                <h5>{blogPost.title}</h5>
                <p>{blogPost.content}</p>
              </li>
            ))}
          </ul>
        </>
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
  const [blogPosts, setBlogPosts] = useState([]);

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

    const fetchBlogPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/v1/blogposts");
        const responseData = response.data;

        if (Array.isArray(responseData.data) && responseData.data.length > 0) {
          setBlogPosts(responseData.data);
        } else {
          setBlogPosts([]);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error.message);
      }
    };

    fetchCategories();
    fetchBlogPosts();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
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
                    onClick={() => handleCategoryClick(category)}
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
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        {categories.map((category) => (
          <Route
            key={category.id}
            path={`/${category.slug}`}
            element={<CategoryPage category={category} blogPosts={blogPosts} />}
          />
        ))}
        {selectedCategory && (
          <Route
            path={`/${selectedCategory?.slug}`}
            element={<CategoryPage category={selectedCategory} blogPosts={blogPosts} />}
          />
        )}
      </Routes>

    </Router>
  );
};

export default Navigation;
