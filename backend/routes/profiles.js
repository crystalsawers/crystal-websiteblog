import { Router } from "express";
const router = Router();

import {
    getProfiles,
    getAProfile,
    createProfile,
    updateProfile,
    deleteProfile
} from "../controllers/profiles.js";

router.route("/").get(getProfiles).post(createProfile);
router.route("/:id").get(getAProfile).put(updateProfile).delete(deleteProfile);

export default router;