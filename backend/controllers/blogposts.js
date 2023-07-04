import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const blogPostValidation = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  published: Joi.boolean().default(false),
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