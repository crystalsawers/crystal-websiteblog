import { Router } from "express";
const router = Router();


import {
    getBlogPosts,
    getABlogPost,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
} from "../controllers/blogposts.js";


router.route("/blogposts").get(getBlogPosts).post(createBlogPost);
router.route("/blogposts/:id").get(getABlogPost).put(updateBlogPost).delete(deleteBlogPost);

export default router;