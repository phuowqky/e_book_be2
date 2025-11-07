import Bookmark from "../../../models/bookmark_model.js";

export const getBookmark = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const bookmark = await Bookmark.findOne({ userId, bookId })
      .populate("bookId", "title coverImage author"); // <-- lấy các trường cần thiết

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Chưa có bookmark cho sách này",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy bookmark thành công",
      data: bookmark,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const setBookmark = async (req, res) => {
  try {
    const { userId, bookId, chapterIndex, position } = req.body;

    if (!userId || !bookId || chapterIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin userId, bookId hoặc chapterIndex",
      });
    }

    let bookmark = await Bookmark.findOne({ userId, bookId });

    if (bookmark) {
      bookmark.chapterIndex = chapterIndex;
      bookmark.position = position ?? 0;
      await bookmark.save();
    } else {
      bookmark = await Bookmark.create({
        userId,
        bookId,
        chapterIndex,
        position,
      });
    }

    // Populate sau khi tạo/cập nhật
    await bookmark.populate("bookId", "title coverImage author");

    res.status(200).json({
      success: true,
      message: "Đánh dấu trang thành công",
      data: bookmark,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  Lấy tất cả bookmark của 1 user (thư viện cá nhân)
export const getBookmarksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookmarks = await Bookmark.find({ userId })
      .populate("bookId", "title coverImage author");

    if (!bookmarks || bookmarks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Người dùng chưa có sách nào trong thư viện",
      });
    }

    // Chuẩn hóa dữ liệu trả về (ví dụ: thêm % tiến độ)
    const data = bookmarks.map((b) => ({
      _id: b._id,
      chapterIndex: b.chapterIndex,
      position: b.position,
      progress: `${b.position || 0}%`, // hoặc tùy logic bạn tính %
      book: {
        _id: b.bookId._id,
        title: b.bookId.title,
        author: b.bookId.author,
        coverImage: b.bookId.coverImage,
      },
    }));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bookmark thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


