import { Router } from "express";

const router = Router();


import {
    getCategories,
    getACategory,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categories.js";

import { authorise } from "../controllers/auth.js";

const requireAdmin = authorise(true);

router.route("/").get(getCategories).post(requireAdmin,createCategory);
router.route("/:id").get(getACategory).put(requireAdmin,updateCategory).delete(requireAdmin,deleteCategory);

export default router;