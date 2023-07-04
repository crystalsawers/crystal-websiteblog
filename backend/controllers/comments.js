import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const commentValidation = Joi.object({
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