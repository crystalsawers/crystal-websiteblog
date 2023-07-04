import { Router } from "express";
const router = Router();

import {
  getUsers,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getOneUser).put(updateUser).delete(deleteUser);

export default router;