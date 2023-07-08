import { Router } from "express";
import { authorise } from "../controllers/auth.js";
const router = Router();


import {
    getBlogPosts,
    getABlogPost,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
} from "../controllers/blogposts.js";


const requireAdmin = authorise(true);

router.route("/").get(getBlogPosts).post(requireAdmin, createBlogPost);
router.route("/:id").get(getABlogPost).put(requireAdmin,updateBlogPost).delete(requireAdmin,deleteBlogPost);

export default router;