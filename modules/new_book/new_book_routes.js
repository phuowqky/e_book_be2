import express from "express";
import { getNewBooks } from "../../modules/new_book/new_book_controller.js";

const router = express.Router();

// 🆕 Lấy danh sách sách mới thêm gần đây
router.get("/", getNewBooks);

export default router;
