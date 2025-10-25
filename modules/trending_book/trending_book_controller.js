import Review from "../../models/review_book_model.js";


// //  Lấy danh sách sách thịnh hành dựa trên đánh giá
// export const getTrendingBooks = async (req, res) => {
//   try {
//     const trending = await Review.aggregate([
//       {
//         $group: {
//           _id: "$bookId",
//           averageRating: { $avg: "$rating" },
//           totalReviews: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { averageRating: -1, totalReviews: -1 },
//       },
//       {
//         $limit: 10, // lấy top 10
//       },
//       {
//         $lookup: {
//           from: "books", // tên collection trong MongoDB
//           localField: "_id",
//           foreignField: "_id",
//           as: "bookInfo",
//         },
//       },
//       {
//         $unwind: "$bookInfo",
//       },
//       {
//         $project: {
//           _id: 0,
//           bookId: "$_id",
//           title: "$bookInfo.title",
//           author: "$bookInfo.author",
//           cover: "$bookInfo.cover",
//           averageRating: 1,
//           totalReviews: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Lấy danh sách sách thịnh hành thành công",
//       data: trending,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getTrendingBooks = async (req, res) => {
  try {
    const trending = await Review.aggregate([
      {
        $group: {
          _id: "$bookId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      { $unwind: "$bookInfo" },
      {
        $project: {
          _id: "$bookInfo._id",
          title: "$bookInfo.title",
          author: "$bookInfo.author",
          description: "$bookInfo.description",
          coverImage: "$bookInfo.coverImage",
          epubFile: "$bookInfo.epubFile",
          epubFileName: "$bookInfo.epubFileName",
          epubFileSize: "$bookInfo.epubFileSize",
          category: "$bookInfo.category",
          tags: "$bookInfo.tags",
          publishYear: "$bookInfo.publishYear",
          totalPages: "$bookInfo.totalPages",
          language: "$bookInfo.language",
          status: "$bookInfo.status",
          createdAt: "$bookInfo.createdAt",
          updatedAt: "$bookInfo.updatedAt",
          __v: "$bookInfo.__v",
          averageRating: 1,
          totalReviews: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sách thịnh hành thành công",
      data: trending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};