import { Router } from "express";
const router = Router();

import { register, login,logout, authorise } from "../controllers/auth.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route('/check-admin').post(authorise(true), (req, res) => {
    res.sendStatus(200);
  });
  
export default router;