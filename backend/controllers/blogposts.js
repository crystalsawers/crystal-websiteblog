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

const getBlogPosts = async (req, res) => {
  try {
    // Sorting
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    // Pagination
    const amount = req.query.amount || paginationDefault.amount;
    const page = req.query.page || paginationDefault.page;

    const query = {
      take: Number(amount),
      skip: (Number(page) - 1) * Number(amount),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        author: true,
        categories: true,
        comments: true,
      },
    };

    // Filtering by field
    if (req.query.title || req.query.published) {
      query.where = {
        title: {
          contains: req.query.title || undefined,
        },
        published: {
          equals: req.query.published === "true" || undefined,
        },
      };
    }

    const blogPosts = await prisma.blogPost.findMany(query);

    if (blogPosts.length === 0) {
      return res.status(200).json({ msg: "No blog posts found" });
    }

    const hasNextPage = blogPosts.length === Number(amount);

    return res.json({
      data: blogPosts,
      nextPage: hasNextPage ? Number(page) + 1 : null,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};


const getABlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id) },
      include: {
        author: true,
        categories: true,
        comments: true,
      },
    });

    if (!blogPost) {
      return res.status(404).json({ msg: `No blog post with the id: ${id} found` });
    }

    return res.json({ data: blogPost });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const createBlogPost = async (req, res) => {
  try {
    const { error, value } = blogPostValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    const { title, content, published } = value;

    const newBlogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        published,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: req.user.id, // Assuming the authenticated user's ID is stored in req.user.id
      },
      include: {
        author: true,
        categories: true,
        comments: true,
      },
    });

    return res.status(201).json({
      msg: "Blog post successfully created",
      data: newBlogPost,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;

    let blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id) },
    });

    if (!blogPost) {
      return res.status(404).json({ msg: `No blog post with the id: ${id} found` });
    }

    blogPost = await prisma.blogPost.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        published,
        updatedAt: new Date(),
      },
      include: {
        author: true,
        categories: true,
        comments: true,
      },
    });

    return res.json({
      msg: `Blog post with the id: ${id} successfully updated`,
      data: blogPost,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    let blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id) },
    });

    if (!blogPost) {
      return res.status(404).json({ msg: `No blog post with the id: ${id} found` });
    }

    blogPost = await prisma.blogPost.delete({
      where: { id: Number(id) },
    });

    return res.json({
      msg: `Blog post with the id: ${id} successfully deleted`,
      data: blogPost,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export {
  getBlogPosts,
  getABlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
};