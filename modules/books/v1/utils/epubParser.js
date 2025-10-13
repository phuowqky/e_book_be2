
import pkg from "epub2";
const EPub = pkg.default || pkg; // ✅ Lấy class EPub

import fs from "fs";
import path from "path";
import os from "os";

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
    // const tempPath = path.resolve(`temp-${Date.now()}.epub`);
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
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