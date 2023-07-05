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


router.route("/").get(getBlogPosts).post(upload.single("image"), createBlogPost);
router.route("/:id").get(getABlogPost).put(updateBlogPost).delete(deleteBlogPost);

export default router;