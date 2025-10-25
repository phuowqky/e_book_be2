import Book from '../../models/book.js';

export const getRandomBooks = async (req, res) => {
  try {
    const randomBooks = await Book.aggregate([
      { $sample: { size: 10 } }, // lấy ngẫu nhiên 10 sách
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          cover: 1,
          category: 1,
          description: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sách ngẫu nhiên thành công",
      data: randomBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};