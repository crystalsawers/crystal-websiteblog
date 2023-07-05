import { Router } from "express";
const router = Router();


import {
    getComments,
    getAComment,
    createComment,
    updateComment,
    deleteComment
} from "../controllers/comments.js";

router.route("/").get(getComments).post(createComment);
router.route("/:id").get(getAComment).put(updateComment).delete(deleteComment);


export default router;