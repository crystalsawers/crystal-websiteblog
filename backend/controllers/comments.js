import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const commentValidation = Joi.object({
    content: Joi.string().required(),
    userId: Joi.number().required(),
    postId: Joi.number().required(),
});

const paginationDefault = {
    amount: 10,
    page: 1,
};


const getComments = async (req, res) => {
    try {

        //Sorting
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
                user: true,
                post: true,
            },
        };

        // Filtering by field
        if (req.query.content || req.query.userId || req.query.postId) {
            query.where = {
                content: {
                    contains: req.query.content || undefined,
                },
                userId: {
                    equals: Number(req.query.userId) || undefined,
                },
                postId: {
                    equals: Number(req.query.postId) || undefined,
                },
            };
        }

        const comments = await prisma.comment.findMany();

        if (comments.length === 0) {
            return res.status(200).json({ msg: "No comments found" });
        }


        const hasNextPage = comments.length === Number(amount);

        return res.json({
            data: comments,
            nextPage: hasNextPage ? Number(page) + 1 : null,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

const getAComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                post: true,
            },
        });

        if (!comment) {
            return res.status(404).json({ msg: `No comment with the id: ${id} found` });
        }

        return res.json({
            data: comment,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

const createComment = async (req, res) => {
    try {

        const { error, value } = commentValidation.validate(req.body);

        if (error) {
            return res.status(400).json({
                msg: error.details[0].message,
            });
        }


        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'User not authorized to create comment',
            });
        }

        const { content, userId, postId } = value;

        const newComment = await prisma.comment.create({
            data: {
                content,
                createdAt: new Date(), // Set the createdAt timestamp
                updatedAt: new Date(), // Set the updatedAt timestamp
                user: { connect: { id: userId } }, // Connect the comment to the author by ID
                post: { connect: { id: postId } }, // Connect the comment to the post by ID
            },
            include: {
                user: true,
                post: true,
            },
        });

        return res.status(201).json({
            msg: "Comment successfully created",
            data: newComment,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'User not authorized to update comment',
            });
        }

        let comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
        });

        if (!comment) {
            return res.status(404).json({ msg: `No comment with the id: ${id} found` });
        }

        comment = await prisma.comment.update({
            where: { id: Number(id) },
            data: {
                content,
                updatedAt: new Date(), // Update the updatedAt timestamp
            },
            include: {
                user: true,
                post: true,
            },
        });

        return res.json({
            msg: `Comment with the id: ${id} successfully updated`,
            data: comment,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};


const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                msg: 'User not authorized to delete comment',
            });
        }

        let comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
        });

        if (!comment) {
            return res.status(404).json({ msg: `No comment with the id: ${id} found` });
        }

        comment = await prisma.comment.delete({
            where: { id: Number(id) },
        });

        return res.json({
            msg: `Comment with the id: ${id} successfully deleted`,
            data: comment,
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        });
    }
};


export {
    getComments,
    getAComment,
    createComment,
    updateComment,
    deleteComment
};