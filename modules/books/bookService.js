// import Book from "../../models/book.js";

// export const getBooksByGenres = async (genres) => {
//   return await Book.find({ category: { $in: genres } })
//     .select("title author category description") // chỉ lấy những trường cần thiết
//     .limit(10); // giới hạn số lượng sách
// };

import Book from "../../models/book.js";
import Chapter from "../../modules/chapters/v1/chapters_model.js";

export const getBooksByGenres = async (genres) => {
  return await Book.find({ category: { $in: genres } })
    .select("title author category description characters summary");
};

export const getAllBooks = async () => {
  return await Book.find();
};

export const getChaptersByBookIds = async (bookIds) => {
  return await Chapter.find({
    bookId: { $in: bookIds },
  }).sort({ order: 1 });
};