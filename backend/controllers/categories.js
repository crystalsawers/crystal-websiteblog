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