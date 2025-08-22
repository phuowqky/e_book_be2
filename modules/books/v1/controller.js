import Book from '../../../models/book.js';
import cloudinary from '../../../config/cloudinary.js';

// Lấy danh sách sách
export async function getBooks(req, res) {
    try {
        const books = await Book.find({ status: 'active' })
            .populate('createdBy', 'userName email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: books });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Lấy chi tiết sách
export async function getBookById(req, res) {
    try {
        const book = await Book.findById(req.params.id)
            .populate('createdBy', 'userName email');
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Tạo sách mới với upload bìa
export async function createBook(req, res) {
    try {
        const { title, author, description, category, tags, publishYear, isbn, totalPages } = req.body;
        
        // Xử lý upload ảnh bìa lên Cloudinary
        let coverImage = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'book-covers', // Tạo folder riêng cho bìa sách
                transformation: [
                    { width: 400, height: 600, crop: 'fill' }, // Resize ảnh bìa
                    { quality: 'auto' } // Tối ưu chất lượng
                ]
            });
            coverImage = result.secure_url;
            
            // Xóa file tạm sau khi upload
            // fs.unlinkSync(req.file.path); // Cần import fs
        }
        
        const book = new Book({
            title,
            author,
            description,
            coverImage,
            category,
            tags: tags ? tags.split(',') : [],
            publishYear,
            isbn,
            totalPages,
            createdBy: req.user.id // Từ middleware auth
        });
        
        await book.save();
        res.status(201).json({ 
            success: true, 
            data: book,
            message: 'Tạo sách thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Cập nhật sách
export async function updateBook(req, res) {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Xóa sách (soft delete)
export async function deleteBook(req, res) {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, message: 'Đã xóa sách thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}