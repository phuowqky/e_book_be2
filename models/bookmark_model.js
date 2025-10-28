import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    chapterIndex: {
      type: Number,
      required: true,
    },
    position: {
      type: Number, // ví dụ: vị trí dòng hoặc phần trăm đọc
      default: 0,
    },
  },
  { timestamps: true }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
