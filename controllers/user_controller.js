
import User from "../models/user.js";


// Toggle favorite book
export async function toggleFavorite(req, res) {
    try {
        const userId = req.user.userId;
        const bookId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }

        // Kiểm tra nếu bookId đã có trong favorites thì bỏ ra, chưa có thì thêm vào
        const index = user.favorites.indexOf(bookId);
        if (index === -1) {
            user.favorites.push(bookId); // thêm
        } else {
            user.favorites.splice(index, 1); // bỏ
        }

        await user.save();

        res.json({ success: true, favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function getFavoriteBooks(req, res) {
    try {
        const user = await User.findById(req.user.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
        }

        res.json({ success: true, data: user.favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

