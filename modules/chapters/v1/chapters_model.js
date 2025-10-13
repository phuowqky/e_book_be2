// import mongoose from "mongoose";

// const chapterSchema = new mongoose.Schema({
//   bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
//   order: { type: Number, required: true },
//   title: { type: String, required: true },
//   content: { type: String, required: true }, // Nội dung HTML hoặc text
// });

// export default mongoose.model("Chapter", chapterSchema);

import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  title: { type: String, required: true },
  index: { type: Number },
  href: { type: String },
});

export default mongoose.model("Chapter", chapterSchema);