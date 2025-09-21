import express from 'express';
import { 
    getBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook 
} from './controller.js';
import { auth } from '../../../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
// Cấu hình multer cho upload file
const upload = multer({ 
    storage: storage,
    dest: 'uploads/',
    limits: {
        fileSize: 50 * 1024 * 1024 // Tăng lên 50MB cho file EPUB
    },
    fileFilter: (req, file, cb) => {
        // Cho phép upload cả ảnh và file EPUB
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/epub+zip') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh và EPUB!'), false);
        }
    }
});

// Public routes - Không cần đăng nhập
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes - Cần đăng nhập
router.post('/', auth, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'epubFile', maxCount: 1 }
]), createBook);
router.put('/:id', auth, updateBook);
router.delete('/:id', auth, deleteBook);

export default router;
