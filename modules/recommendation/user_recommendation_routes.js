import express from "express";
import { getUserReadingProfile } from "./user_recommendation_controller.js";

const router = express.Router();

router.get("/:userId", getUserReadingProfile);

export default router;
