import express from "express";
import { toggleFavorite, getFavoriteBooks } from "../controllers/user_controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post('/:id/favorite', auth, toggleFavorite);

router.get('/favorites', auth, getFavoriteBooks);

export default router;

