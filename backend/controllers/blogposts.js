import Joi from "joi";
import fs from "fs";
import mime from "mime-types";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const blogPostValidation = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  published: Joi.boolean().default(false),
  image: Joi.string().optional(),
  categories: Joi.array().items(Joi.number()).optional(),
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
        user: true,
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
        user: true,
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

    const { id } = req.user;
    const { title, content, published, categories } = value;

    let image = ""; // Declare the image variable with an empty string


    if (req.body.image) {
      // The image data is provided as Base64 string in the request body
      const base64Data = req.body.image;
      console.log('base64Data:', base64Data);
      const base64Image = base64Data.split(";base64,").pop(); // Extract the image data without the metadata
      const imageType = base64Data.split(";")[0].split("/")[1]; // Extract the image type (e.g., png, jpeg)
      console.log('imageType:', imageType);

      // Generate a unique file name
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileName = `image-${uniqueSuffix}.${imageType}`;

      // Save the image file to a specified location
      fs.writeFileSync(`uploads/${fileName}`, base64Image, { encoding: "base64" });

      // Set the image variable with the file name
      image = fileName;
    }


    // Create the blog post and associate it with the provided category IDs
    await prisma.blogPost.create({
      data: {
        title,
        content,
        published,
        image,
        user: { connect: { id } },
        categories: {
          connect: categories.map((categoryId) => ({ id: categoryId })),
        },
      },
    });

    // Fetch the newly created blog post including the image field
    const newBlogPost = await prisma.blogPost.findFirst({
      where: { title, content, published, image },
      include: {
        user: true,
        categories: true,
        comments: true,
      },
    });

    // Return the response
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
    const userId = req.user.id;
    const { title, content, published, categories } = req.body;

    let blogPost = await prisma.blogPost.findUnique({
      where: { id: Number(id) },
    });

    if (!blogPost) {
      return res.status(404).json({ msg: `No blog post with the id: ${id} found` });
    }

    let image = blogPost.image; // Preserve the existing image value

    if (req.file) {
      // The image file was uploaded
      image = req.file.path; // Use the file path on the local file system
    }

    blogPost = await prisma.blogPost.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        published,
        image,
        updatedAt: new Date(),
        user: { connect: { id: userId } },
        categories: {
          set: categories, // Replace the existing categories with the new category IDs
        },
      },
      include: {
        user: true,
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
  deleteBlogPost,
};