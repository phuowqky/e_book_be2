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


