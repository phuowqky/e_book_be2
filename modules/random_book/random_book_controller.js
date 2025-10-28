import Book from '../../models/book.js';


export const getRandomBooks = async (req, res) => {
  try {
    const randomBooks = await Book.aggregate([
      { $sample: { size: 10 } }, // Lấy ngẫu nhiên 10 cuốn sách
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          description: 1,
          coverImage: 1,
          epubFile: 1,
          epubFileName: 1,
          epubFileSize: 1,
          category: 1,
          tags: 1,
          publishYear: 1,
          totalPages: 1,
          language: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
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