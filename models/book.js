import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String }, // URL từ Cloudinary
    epubFile: { type: String }, // URL từ Firebase Storage
    epubFileName: { type: String }, // Tên file gốc
    epubFileSize: { type: Number }, // Kích thước file
    category: { type: String },
    tags: [String],
    publishYear: { type: Number },
    isbn: { type: String },
    totalPages: { type: Number },
    language: {type: String, default: 'English'},
    status: { type: String, enum: ['Mở', 'Khóa'], default: 'Mở' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
