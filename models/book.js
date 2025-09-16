import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String }, // URL từ Cloudinary
    category: { type: String },
    tags: [String],
    publishYear: { type: Number },
    isbn: { type: String },
    totalPages: { type: Number },
    language: {type: String, default: 'English'},
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
