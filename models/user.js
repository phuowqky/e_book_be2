import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // yearOfBirth: { type: Number, required: true },
    password: { type: String, required: true },
    avt: { type: String, default: "" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
    role: { type: Number, default: 1 } // Thêm trường role với giá trị mặc định là 1 (USER)
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 👇 Xuất default để import User from '...'
export default User;