import { Router } from "express";
import { authorise } from "../controllers/auth.js";
const router = Router();

import {
  getUsers,
  getOneUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";

const requireAdmin = authorise(true);

router.route("/").get(getUsers);
router.route("/:id").get(getOneUser).put(authorise(),updateUser).delete(authorise(),deleteUser);

export default router;