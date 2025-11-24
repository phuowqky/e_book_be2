import express from "express";
import { register, login, updateAccount, getAccount, getAvatar} from "../controllers/authcontroller.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../modules/banner/banner_routes.js";

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// router.put("/update", auth, updateAccount);

router.put("/update", auth, upload.single("avt"), updateAccount);

router.get("/me", auth, getAccount);

router.get("/avatar", auth, getAvatar);

export default router;