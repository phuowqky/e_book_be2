// controllers/bookController.js

import Book from "../../models/book.js";

export async function searchBooks(req, res) {
  try {
    const keyword = req.query.q;

    // Nếu không có keyword
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập từ khóa tìm kiếm."
      });
    }

    // Regex cho tìm kiếm không phân biệt hoa thường
    const searchRegex = { $regex: keyword, $options: "i" };

    // Danh sách điều kiện tìm kiếm
    const query = {
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { isbn: searchRegex }
      ]
    };

    const books = await Book.find(query)
      .select("-__v")
      .populate("createdBy", "userName email");

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sách phù hợp với từ khóa."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm sách thành công",
      data: { books }
    });

  } catch (err) {
    console.error("Lỗi tìm kiếm sách:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message
    });
  }
}
