// import Book from "../../models/book.js";

// export const getBooksByGenres = async (genres) => {
//   return await Book.find({ category: { $in: genres } })
//     .select("title author category description") // chỉ lấy những trường cần thiết
//     .limit(10); // giới hạn số lượng sách
// };

import Book from "../../models/book.js";

export const getBooksByGenres = async (genres) => {
  return await Book.find({ category: { $in: genres } })
    .select("title author category description characters summary");
};
