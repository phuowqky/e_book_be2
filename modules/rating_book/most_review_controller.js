import Review from "../../models/review_book_model.js";
import Book from "../../models/book.js";

export const getMostReviewedBooks = async (req, res) => {
  try {
    const mostReviewed = await Review.aggregate([
      {
        $group: {
          _id: "$bookId",
          reviewCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 }, // 👉 chỉ lấy 5 sách nhiều review nhất
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
          _id: 0,
          bookId: "$bookInfo._id",
          title: "$bookInfo.title",
          author: "$bookInfo.author",
          category: "$bookInfo.category",
          reviewCount: 1,
          avgRating: { $round: ["$avgRating", 1] }, // làm tròn 1 chữ số
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top 5 sách có nhiều đánh giá nhất",
      data: mostReviewed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
