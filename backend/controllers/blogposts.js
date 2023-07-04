import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const blogPostValidation = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(), // meaning you have to use a the @ for the email
    password: Joi.string()
        .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9])"))
        .min(10)
        .required(), //minimum of 10 characters, and you have to use both alphanumeric and special characters

});

const paginationDefault = {
    amount: 10,
    page: 1,
};

const getBlogPosts = () => {
    // TODO: Implement logic to retrieve blog posts
  };
  
  const getABlogPost = () => {
    // TODO: Implement logic to retrieve a single blog post
  };
  
  const createBlogPost = () => {
    // TODO: Implement logic to create a blog post
  };
  
  const updateBlogPost = () => {
    // TODO: Implement logic to update a blog post
  };
  
  const deleteBlogPost = () => {
    // TODO: Implement logic to delete a blog post
  };
  
  export {
    getBlogPosts,
    getABlogPost,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
  };