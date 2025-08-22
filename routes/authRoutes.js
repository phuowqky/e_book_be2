import express from "express";
import { register, login } from "../controllers/authcontroller.js";

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

export default router;