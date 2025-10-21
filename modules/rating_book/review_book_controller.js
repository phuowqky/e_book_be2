import Review from "../../models/review_book_model.js";
import Book from '../../models/book.js';
import User from "../../models/user.js";

// 🟢 Tạo hoặc cập nhật review của người dùng cho 1 sách
export const createOrUpdateReview = async (req, res) => {
  try {
    const { userId, bookId, rating, comment } = req.body;

    if (!userId || !bookId || !rating) {
      return res.status(400).json({ message: "Thiếu dữ liệu yêu cầu" });
    }

    // Kiểm tra sách và người dùng có tồn tại không
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Tìm review cũ nếu có
    let review = await Review.findOne({ userId, bookId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      review.updatedAt = Date.now();
      await review.save();
    } else {
      review = await Review.create({ userId, bookId, rating, comment });
    }

    res.status(200).json({ success: true ,message: "Đánh giá thành công", review });
  } catch (error) {
    res.status(500).json({success: false  ,message: "Lỗi server", error: error.message });
  }
};

// 🟡 Lấy tất cả review của 1 sách (chỉ sách có comment mới hiển thị)
export const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await Review.find({ bookId, comment: { $ne: "" } })
      .populate("userId", "userName") // chỉ lấy userName từ userId
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};