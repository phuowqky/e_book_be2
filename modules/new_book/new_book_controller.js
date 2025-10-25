import Book from '../../models/book.js';

// 🆕 Lấy danh sách sách mới thêm gần đây
export const getNewBooks = async (req, res) => {
  try {
    const newBooks = await Book.find()
      .sort({ createdAt: -1 }) // sắp xếp theo thời gian thêm mới nhất
      .limit(10) // chỉ lấy 10 cuốn gần nhất
      .select("_id title author cover category description createdAt");

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sách mới thêm gần đây thành công",
      data: newBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
