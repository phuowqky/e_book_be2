import Review from "../../models/review_book_model.js";
import Book from "../../models/book.js";

export const getUserReadingProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    // Lấy review của user, populate thông tin sách
    const reviews = await Review.find({ userId })
      .populate("bookId", "title category")
      .sort({ updatedAt: -1 });

    if (!reviews.length) {
      return res.status(200).json({
        success: true,
        favoriteGenres: [],
        recentBooks: [],
        message: "Người dùng chưa có đánh giá nào",
      });
    }

    // Đếm số lần xuất hiện của từng thể loại (từ rating >= 4)
    const genreCount = {};
    reviews.forEach((r) => {
      if (r.rating >= 4 && r.bookId?.category) {
        genreCount[r.bookId.category] =
          (genreCount[r.bookId.category] || 0) + 1;
      }
    });

    // Sắp xếp và lấy top 3 thể loại yêu thích
    const favoriteGenres = Object.keys(genreCount)
      .sort((a, b) => genreCount[b] - genreCount[a])
      .slice(0, 3);

    // Lấy 3 cuốn gần đây nhất (theo updatedAt)
    const recentBooks = reviews
      .slice(0, 3)
      .map((r) => r.bookId?.title)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      favoriteGenres,
      recentBooks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
