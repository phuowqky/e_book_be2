import express from "express";
import { createOrUpdateReview, getReviewsByBook } from "../rating_book/review_book_controller.js";

const router = express.Router();

// POST /api/reviews
router.post("/", createOrUpdateReview);

// GET /api/reviews/:bookId
router.get("/:bookId", getReviewsByBook);

export default router;