import { Router } from "express";
const router = Router();


import {
    getCategories,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categories.js";


router.route("/categories").get(getCategories).post(createCategory);
router.route("/categories/:id").get(getACategory).put(updateCategory).delete(deleteCategory);

export default router;