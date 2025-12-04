// routes/bookRoutes.js

import express from "express";
import { searchBooks } from "../../modules/search_book/search_book_controller.js";

const router = express.Router();

router.get("/", searchBooks);

export default router;
