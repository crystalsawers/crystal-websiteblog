import { Router } from "express";
import { authorise } from "../controllers/auth.js";
const router = Router();

import {
    getProfiles,
    getAProfile,
    createProfile,
    updateProfile,
    deleteProfile
} from "../controllers/profiles.js";

router.route("/").get(getProfiles).post(authorise(), createProfile);
router.route("/:id").get(getAProfile).put(authorise(), updateProfile).delete(authorise(), deleteProfile);

export default router;