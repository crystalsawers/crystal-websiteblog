import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const categoryValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
});

const paginationDefault = {
  amount: 10,
  page: 1,
};

const getCategories = async (req, res) => {
  try {

    // Sorting
    const sortBy = req.query.sortBy || "id";
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
        posts: true,
      },
    };

    // Filtering by field
    if (req.query.name || req.query.description) {
      query.where = {
        name: {
          contains: req.query.name || undefined,
        },
        description: {
          contains: req.query.description || undefined,
        },
      };
    }

    const categories = await prisma.category.findMany(query);

    if (categories.length === 0) {
      return res.status(200).json({ msg: "No categories found" });
    }

    const hasNextPage = categories.length === Number(amount);

    return res.json({
      data: categories,
      nextPage: hasNextPage ? Number(page) + 1 : null,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getACategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        posts: true,
      },
    });

    if (!category) {
      return res.status(404).json({ msg: `No category with the id: ${id} found` });
    }

    return res.json({ data: category });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error, value } = categoryValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { name, description } = value;

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json({
      msg: "Category successfully created",
      data: newCategory,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = categoryValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ msg: error.details[0].message });
    }

    const { name, description } = value;

    let category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ msg: `No category with the id: ${id} found` });
    }

    category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
      },
    });

    return res.json({
      msg: `Category with the id: ${id} successfully updated`,
      data: category,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;


    let category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ msg: `No category with the id: ${id} found` });
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.json({
      msg: `Category with the id: ${id} successfully deleted`,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export {
  getCategories,
  getACategory,
  createCategory,
  updateCategory,
  deleteCategory
};