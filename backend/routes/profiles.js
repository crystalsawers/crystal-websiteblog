import { Router } from "express";
import authRoute from '../middleware/authRoute.js';
const router = Router();

import {
    getProfiles,
    getAProfile,
    createProfile,
    updateProfile,
    deleteProfile
} from "../controllers/profiles.js";

router.route("/").get(getProfiles).post(authRoute, createProfile);
router.route("/:id").get(getAProfile).put(authRoute, updateProfile).delete(authRoute, deleteProfile);

export default router;