import { Router } from "express";
import { authorise } from "../controllers/auth.js";
const router = Router();


import {
    getComments,
    getAComment,
    createComment,
    updateComment,
    deleteComment
} from "../controllers/comments.js";


router.route("/").get(getComments).post(authorise(),createComment);
router.route("/:id").get(getAComment).put(authorise(),updateComment).delete(authorise(), deleteComment);


export default router;