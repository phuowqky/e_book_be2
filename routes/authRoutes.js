import express from "express";
import { register, login, updateAccount, getAccount} from "../controllers/authcontroller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

router.put("/update", auth, updateAccount);

router.get("/me", auth, getAccount);

export default router;