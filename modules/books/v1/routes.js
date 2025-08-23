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
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: (req, file, cb) => {
        // Chỉ cho phép upload ảnh
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh!'), false);
        }
    }
});

// Public routes - Không cần đăng nhập
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes - Cần đăng nhập
router.post('/', auth, upload.single('coverImage'), createBook);
router.put('/:id', auth, updateBook);
router.delete('/:id', auth, deleteBook);

export default router;
