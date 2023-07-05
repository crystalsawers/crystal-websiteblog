import { Router } from "express";
const router = Router();


import {
    getCategories,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categories.js";


router.route("/").get(getCategories).post(createCategory);
router.route("/:id").get(getACategory).put(updateCategory).delete(deleteCategory);

export default router;