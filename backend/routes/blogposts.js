import { Router } from "express";
import { upload } from "../controllers/blogposts.js";
const router = Router();


import {
    getBlogPosts,
    getABlogPost,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
} from "../controllers/blogposts.js";


router.route("/blogposts").get(getBlogPosts).post(upload.single("image"), createBlogPost);
router.route("/blogposts/:id").get(getABlogPost).put(updateBlogPost).delete(deleteBlogPost);

export default router;