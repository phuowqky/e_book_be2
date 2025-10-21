import express from "express";
import {
  getTrendingBooks,
} from "../../modules/trending_book/trending_book_controller.js";

const router = express.Router();


// 📊 Lấy danh sách sách thịnh hành
router.get("/", getTrendingBooks);

export default router;