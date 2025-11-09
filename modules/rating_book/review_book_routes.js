import express from "express";
import { createOrUpdateReview, getReviewsByBook, deleteReview } from "../rating_book/review_book_controller.js";

const router = express.Router();

// POST /api/reviews
router.post("/", createOrUpdateReview);

// GET /api/reviews/:bookId
router.get("/:bookId", getReviewsByBook);

router.delete("/:userId/:bookId", deleteReview);
export default router;