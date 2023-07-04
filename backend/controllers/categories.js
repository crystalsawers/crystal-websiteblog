import Joi from "joi";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const categoryValidation = Joi.object({
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

const getCategories = () => {
    // TODO: Implement logic to retrieve categories
  };
  
  const getACategory = () => {
    // TODO: Implement logic to retrieve a single category
  };
  
  const createCategory = () => {
    // TODO: Implement logic to create a category
  };
  
  const updateCategory = () => {
    // TODO: Implement logic to update a category
  };
  
  const deleteCategory = () => {
    // TODO: Implement logic to delete a category
  };
  
  export {
    getCategories,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory
  };