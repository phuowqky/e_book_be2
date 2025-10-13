
// import pkg from "epub2";
// const EPub = pkg.default || pkg; // ✅ Lấy class EPub

// import fs from "fs";
// import path from "path";
// import os from "os";

// /**
//  * Hàm parse EPUB từ URL hoặc file path và lưu vào DB
//  * @param {string} epubUrl - link EPUB trên Supabase
//  * @param {string} bookId - ID của sách trong MongoDB
//  */
// export async function parseEpubAndSave(epubUrl, bookId) {
//   try {
//     console.log("🔄 Đang tải EPUB từ Supabase...");
//     const response = await fetch(epubUrl);
//     if (!response.ok) throw new Error("Không tải được file EPUB từ URL.");

//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // 📂 Tạo file tạm
//     // const tempPath = path.resolve(`temp-${Date.now()}.epub`);
//     const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
//     fs.writeFileSync(tempPath, buffer);

//     console.log("✅ EPUB tải xong, bắt đầu parse...");

//     // ⚙️ Parse EPUB
//     const epub = new EPub(tempPath); // ✅ phải dùng new

//     // Dùng Promise để đợi parse xong
//     const bookData = await new Promise((resolve, reject) => {
//       epub.on("end", () => {
//         resolve({
//           metadata: epub.metadata,
//           chapters: epub.flow.map((ch, index) => ({
//             index,
//             title: ch.title || `Chương ${index + 1}`,
//             href: ch.href,
//           })),
//         });
//       });

//       epub.on("error", reject);
//       epub.parse();
//     });

//     console.log(`📘 Sách: ${bookData.metadata.title}`);
//     console.log(`📄 Tổng số chương: ${bookData.chapters.length}`);

//     fs.unlinkSync(tempPath);
//     return bookData;
//   } catch (error) {
//     console.error("❌ Lỗi parse EPUB:", error);
//     throw error;
//   }
// }

import pkg from "epub2";
const EPub = pkg.default || pkg; // ✅ tương thích cả CJS & ESM

import fs from "fs";
import path from "path";
import os from "os";

/**
 * Parse EPUB từ URL hoặc file path và trả về metadata + danh sách chapter
 * @param {string} epubUrl - link EPUB (trên Supabase hoặc URL public)
 * @param {string} [bookId] - ID của sách (tùy chọn)
 */
export async function parseEpubAndSave(epubUrl, bookId = null) {
  try {
    console.log("🔄 Đang tải EPUB từ:", epubUrl);

    // 1️⃣ Tải file EPUB từ URL
    const response = await fetch(epubUrl);
    if (!response.ok) throw new Error("Không tải được file EPUB từ URL.");

    const buffer = Buffer.from(await response.arrayBuffer());

    // 2️⃣ Tạo file tạm an toàn
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
    fs.writeFileSync(tempPath, buffer);

    console.log("✅ EPUB tải xong, bắt đầu parse...");

    // 3️⃣ Parse EPUB bằng epub2
    const epub = new EPub(tempPath);

    const bookData = await new Promise((resolve, reject) => {
      epub.on("end", () => {
        // 📘 Metadata cơ bản
        const metadata = {
          title: epub.metadata?.title || "Không rõ tiêu đề",
          author: epub.metadata?.creator || "Không rõ tác giả",
          description: epub.metadata?.description || "",
          cover: epub.metadata?.cover || "",
        };

        // 📄 Danh sách chương (lọc bớt các file không phải nội dung)
        const chapters = epub.flow
          .filter((ch) => {
            if (!ch.href) return false;
            return !/cover|toc|nav|info|thong_tin|title|copyright|acknowledg/i.test(
              ch.href
            );
          })
          .map((ch, index) => ({
            index,
            title:
              ch.title && !/cover|toc/i.test(ch.title)
                ? ch.title.trim()
                : `Chương ${index + 1}`,
            href: ch.href,
          }));

        resolve({ metadata, chapters });
      });

      epub.on("error", reject);
      epub.parse();
    });

    // 4️⃣ Xóa file tạm
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log(`📘 Sách: ${bookData.metadata.title}`);
    console.log(`📄 Tổng số chương hợp lệ: ${bookData.chapters.length}`);

    return bookData;
  } catch (error) {
    console.error("❌ Lỗi parse EPUB:", error);
    throw error;
  }
}