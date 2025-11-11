// routes/book_rank_routes.js
import express from "express";
import { getMostReviewedBooks } from "../../modules/rating_book/most_review_controller.js";

const router = express.Router();

// Route: GET /api/books/ranking/most-reviewed
router.get("/", getMostReviewedBooks);

export default router;
