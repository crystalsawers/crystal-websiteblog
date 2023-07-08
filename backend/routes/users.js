import { Router } from "express";
const router = Router();

import {
  getUsers,
  getOneUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";

router.route("/").get(getUsers);
router.route("/:id").get(getOneUser).put(updateUser).delete(deleteUser);

export default router;