// import pkg from "epub2";
// const { parseEpub } = pkg;
// import fetch from "node-fetch";
// import path from "path";
// import Chapter from "../../../chapters/v1/chapters_model.js";
// import Book from "../../../../models/book.js";
// import fs from "fs";



// // export const parseEpubAndSave = async (bookId, epubUrl) => {
// //   try {
// //     console.log("🔄 Đang tải EPUB từ Supabase...");
// //         // ✅ 1. Tạo thư mục temp nếu chưa tồn tại
// //     const tempDir = path.join(process.cwd(), "temp");
// //     if (!fs.existsSync(tempDir)) {
// //       fs.mkdirSync(tempDir, { recursive: true });
// //     }

    

// //     // 1️⃣ Tải file EPUB từ link Supabase
// //     const res = await fetch(epubUrl);
// //     const buffer = await res.arrayBuffer();
// //     const epubPath = path.join("temp", `${bookId}.epub`);
// //     fs.writeFileSync(epubPath, Buffer.from(buffer));

// //     console.log("✅ EPUB tải xong, bắt đầu parse...");

// //     // 2️⃣ Parse EPUB
// //     const epub = await parseEpub(epubPath);
// //     const metadata = epub.metadata;
// //     const chapters = epub.flow; // danh sách chương

// //     console.log("📖 Metadata:", metadata.title, "-", metadata.creator);
// //     console.log("📚 Tổng số chương:", chapters.length);

// //     // 3️⃣ Lưu metadata vào Book nếu trống
// //     await Book.findByIdAndUpdate(bookId, {
// //       title: metadata.title || "Không rõ",
// //       author: metadata.creator || "Không rõ",
// //     });

// //     // 4️⃣ Lưu từng chapter vào DB
// //     for (let i = 0; i < chapters.length; i++) {
// //       const ch = chapters[i];
// //       await Chapter.create({
// //         bookId,
// //         order: i + 1,
// //         title: ch.title || `Chương ${i + 1}`,
// //         content: ch.content || "",
// //       });
// //     }

// //     console.log("✅ Đã lưu tất cả chương vào DB");

// //     // 5️⃣ Xóa file EPUB tạm
// //     fs.unlinkSync(epubPath);

// //   } catch (err) {
// //     console.error("❌ Lỗi parse EPUB:", err);
// //   }
// // };

// export const parseEpubAndSave = async (bookId, epubUrl) => {
//   try {
//     console.log("🔄 Đang tải EPUB từ Supabase...");

//     // ✅ 1. Tạo thư mục temp nếu chưa tồn tại
//     const tempDir = path.join(process.cwd(), "temp");
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     // ✅ 2. Ghi file EPUB tạm
//     const res = await fetch(epubUrl);
//     const buffer = await res.arrayBuffer();
//     const epubPath = path.join(tempDir, `${bookId}.epub`);
//     fs.writeFileSync(epubPath, Buffer.from(buffer));

//     console.log("✅ EPUB tải xong, bắt đầu parse...");

//     // ✅ 3. Parse EPUB
//     const epub = await parseEpub(epubPath);
//     const metadata = epub.metadata || {};
//     const chapters = epub.flow || [];

//     console.log("📖 Metadata:", metadata.title, "-", metadata.creator);
//     console.log("📚 Tổng số chương:", chapters.length);

//     // ✅ 4. Cập nhật thông tin sách (nếu trống)
//     await Book.findByIdAndUpdate(bookId, {
//       title: metadata.title || "Không rõ",
//       author: metadata.creator || "Không rõ",
//     });

//     // ✅ 5. Lưu từng chương vào DB
//     if (!chapters.length) {
//       console.warn("⚠️ EPUB không có chương nào (flow trống)");
//     }

//     for (let i = 0; i < chapters.length; i++) {
//       const ch = chapters[i];
//       await Chapter.create({
//         bookId,
//         order: i + 1,
//         title: ch.title || `Chương ${i + 1}`,
//         content: ch.content || "",
//       });
//     }

//     console.log(`✅ Đã lưu ${chapters.length} chương vào DB`);

//     // ✅ 6. Xóa file EPUB tạm
//     fs.unlinkSync(epubPath);
//     console.log("🧹 Đã xóa file tạm:", epubPath);

//   } catch (err) {
//     console.error("❌ Lỗi parse EPUB:", err);
//   }
// };

import pkg from "epub2";
const EPub = pkg.default || pkg; // ✅ Lấy class EPub

import fs from "fs";
import path from "path";

/**
 * Hàm parse EPUB từ URL hoặc file path và lưu vào DB
 * @param {string} epubUrl - link EPUB trên Supabase
 * @param {string} bookId - ID của sách trong MongoDB
 */
export async function parseEpubAndSave(epubUrl, bookId) {
  try {
    console.log("🔄 Đang tải EPUB từ Supabase...");
    const response = await fetch(epubUrl);
    if (!response.ok) throw new Error("Không tải được file EPUB từ URL.");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 📂 Tạo file tạm
    const tempPath = path.resolve(`temp-${Date.now()}.epub`);
    fs.writeFileSync(tempPath, buffer);

    console.log("✅ EPUB tải xong, bắt đầu parse...");

    // ⚙️ Parse EPUB
    const epub = new EPub(tempPath); // ✅ phải dùng new

    // Dùng Promise để đợi parse xong
    const bookData = await new Promise((resolve, reject) => {
      epub.on("end", () => {
        resolve({
          metadata: epub.metadata,
          chapters: epub.flow.map((ch, index) => ({
            index,
            title: ch.title || `Chương ${index + 1}`,
            href: ch.href,
          })),
        });
      });

      epub.on("error", reject);
      epub.parse();
    });

    console.log(`📘 Sách: ${bookData.metadata.title}`);
    console.log(`📄 Tổng số chương: ${bookData.chapters.length}`);

    fs.unlinkSync(tempPath);
    return bookData;
  } catch (error) {
    console.error("❌ Lỗi parse EPUB:", error);
    throw error;
  }
}