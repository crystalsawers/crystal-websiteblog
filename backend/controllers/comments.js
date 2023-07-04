import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const commentValidation = Joi.object({
    content: Joi.string().required(),
    authorId: Joi.number().required(),
    postId: Joi.number().required(),
});

const paginationDefault = {
    amount: 10,
    page: 1,
};


const getComments = () => {
    // TODO: Implement logic to retrieve comments
};

const getAComment = () => {
    // TODO: Implement logic to retrieve a single comment
};

const createComment = () => {
    // TODO: Implement logic to create a comment
};

const updateComment = () => {
    // TODO: Implement logic to update a comment
};

const deleteComment = () => {
    // TODO: Implement logic to delete a comment
};

export {
    getComments,
    getAComment,
    createComment,
    updateComment,
    deleteComment
};