import express from "express";
import { getChapterContent } from '../../books/v1/controller.js';

const router = express.Router();

// Route riêng để lấy nội dung chapter
router.get("/:bookId/:index", getChapterContent);

export default router;