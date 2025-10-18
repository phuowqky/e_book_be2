import express from "express";
import { getChapterContent, 
        getListChapters
} from '../../books/v1/controller.js';

const router = express.Router();

// Route để lấy list chapter
router.get("/:bookId", getListChapters);

// Route  để lấy nội dung chapter
// router.get("/:bookId/:index", getChapterContent);

export default router;