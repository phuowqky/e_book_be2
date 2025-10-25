import express from "express";
import { getRandomBooks } from "../../modules/random_book/random_book_controller.js";

const router = express.Router();

// 🎲 Lấy danh sách sách ngẫu nhiên
router.get("/", getRandomBooks);

export default router;