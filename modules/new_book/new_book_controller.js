import Book from '../../models/book.js';

export const getNewBooks = async (req, res) => {
  try {
    const newBooks = await Book.find()
      .sort({ createdAt: -1 }) // sắp xếp theo thời gian thêm mới nhất
      .limit(10)
      .select(
        "_id title author description coverImage epubFile epubFileName epubFileSize category tags publishYear totalPages language status createdAt updatedAt __v"
      ); // chọn đầy đủ trường cần thiết

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