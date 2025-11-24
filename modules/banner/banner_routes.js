import express from "express";
import multer from "multer";
import { createBanner, getBanners, deleteAllBanners } from "../../modules/banner/banner_controller.js";

const router = express.Router();

// Dùng memoryStorage cho Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Chỉ cho phép upload file ảnh!"), false);
  },
});

//  Routes
router.get("/", getBanners); // Xem danh sách banner
router.post("/", upload.single("image"), createBanner); // Tạo banner mới
router.delete("/", deleteAllBanners); // Xóa tất cả banner

export { upload };
export default router;
