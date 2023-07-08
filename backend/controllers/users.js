/* Controller for prisma model : User */
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userValidation = Joi.object({
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

const getUsers = async (req, res) => {
  try {
    //Sorting
    const sortBy = req.query.sortBy || "username";
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
        profile: true,
        posts: true,
        comments: true,
      },
    };

    // Filtering by field
    if (req.query.name || req.query.username || req.query.email || req.query.password || req.query.role) {
      query.where = {
        name: {
          contains: req.query.name || undefined,
        },
        username: {
          contains: req.query.username || undefined,
        },
        email: {
          contains: req.query.email || undefined,
        },
        password: {
          in: req.query.password || undefined,
        },
        role: {
          in: req.query.role || undefined,
        },
      };
    }
    const users = await prisma.user.findMany(query);

    if (users.length === 0) {
      return res.status(200).json({ msg: "No users found" });
    }

    const hasNextPage = users.length === Number(amount);

    return res.json({
      data: users,
      nextPage: hasNextPage ? Number(page) + 1 : null,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};


const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        profile: true,
        posts: true,
        comments: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: `No user with the id: ${id} found` });
    }
    return res.json({ data: user });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, password, role } = req.body;

    let user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ msg: `No user with the id: ${id} found` });
    }

    user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        username,
        email,
        password,
        role,
        updatedAt: new Date(), // Update the updatedAt timestamp
      },
    });

    return res.json({
      msg: `User with the id: ${id} successfully updated`,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(200).json({ msg: `No user with the id: ${id} found` });
    }

    user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    return res.json({
      msg: `User with the id: ${id} successfully deleted`,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};

export {
  getUsers,
  getOneUser,
  updateUser,
  deleteUser
};