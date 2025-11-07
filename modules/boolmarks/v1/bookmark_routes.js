import express from "express";
import { setBookmark, getBookmark, getBookmarksByUser, getBookmarksByStatus} from "../../boolmarks/v1/bookmark_controller.js";

const router = express.Router();

// POST /api/bookmark - thêm/cập nhật bookmark
router.post("/", setBookmark);

// GET /api/bookmark/:userId/:bookId - lấy bookmark
router.get("/:userId/:bookId", getBookmark);

router.get("/:userId", getBookmarksByUser);

router.get("/:userId/status/:status", getBookmarksByStatus);

export default router;
