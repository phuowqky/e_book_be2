import express from "express";
import { getBookRecommendation } from "./chat_recommendation_controller.js";

const router = express.Router();

// router.get("/:userId", getBookRecommendation);
router.post("/:userId", getBookRecommendation);

export default router;
