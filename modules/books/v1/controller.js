import Book from '../../../models/book.js';
import cloudinary from '../../../config/cloudinary.js';
import streamifier from "streamifier";
import { supabase } from '../../../config/supabase.js';

// Lấy danh sách sách
export async function getBooks(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page -1) * limit;
        
        const books = await Book.find({ status: 'active' })
            .populate('createdBy', 'userName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments({ status: 'active' });

        res.json({ success: true, data: books, pagination:{
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        } });
    } catch (error) {
        res.status(200).json({ success: false, message: error.message });
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

export async function createBook(req, res) {
    try {
        const { title, author, description, category, tags, publishYear, isbn, totalPages, language } = req.body;

        let coverImage = '';
        let epubFile = '';
        let epubFileName = '';
        let epubFileSize = 0;

        // Upload cover image lên Cloudinary
        if (req.files && req.files.coverImage) {
            const uploadCoverImage = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'book-covers',
                            transformation: [
                                { width: 400, height: 600, crop: 'fill' },
                                { quality: 'auto' }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.files.coverImage[0].buffer).pipe(stream);
                });
            };

            const result = await uploadCoverImage();
            coverImage = result.secure_url;
        }

        // Upload EPUB file lên Supabase Storage
        if (req.files && req.files.epubFile) {
            const epubFileData = req.files.epubFile[0];
            const fileName = `epub-files/${Date.now()}-${epubFileData.originalname}`;
            
            try {
                const { data, error } = await supabase.storage
                    .from('ebook_storage1') // Tên bucket mới
                    .upload(fileName, epubFileData.buffer, {
                        contentType: epubFileData.mimetype,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    throw error;
                }

                // Lấy public URL
                const { data: urlData } = supabase.storage
                    .from('ebook_storage1') // Tên bucket mới
                    .getPublicUrl(fileName);

                epubFile = urlData.publicUrl;
                epubFileName = epubFileData.originalname;
                epubFileSize = epubFileData.size;
            } catch (error) {
                console.error('Error uploading to Supabase:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Lỗi upload file EPUB: ' + error.message 
                });
            }
        }

        const book = new Book({
            title,
            author,
            description,
            coverImage,
            epubFile,
            epubFileName,
            epubFileSize,
            category,
            tags: tags ? tags.split(',') : [],
            publishYear,
            isbn,
            totalPages,
            language,
            createdBy: req.user.id
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