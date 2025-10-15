
import pkg from "epub2";
const EPub = pkg.default || pkg; //  tương thích cả CJS & ESM

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
    console.log(" Đang tải EPUB từ:", epubUrl);

    //  Tải file EPUB từ URL
    const response = await fetch(epubUrl);
    if (!response.ok) throw new Error("Không tải được file EPUB từ URL.");

    const buffer = Buffer.from(await response.arrayBuffer());

    //  Tạo file tạm an toàn
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
    fs.writeFileSync(tempPath, buffer);

    console.log(" EPUB tải xong, bắt đầu parse...");

    //  Parse EPUB bằng epub2
    const epub = new EPub(tempPath);

    const bookData = await new Promise((resolve, reject) => {
      epub.on("end", () => {
        //  Metadata cơ bản
        const metadata = {
          title: epub.metadata?.title || "Không rõ tiêu đề",
          author: epub.metadata?.creator || "Không rõ tác giả",
          description: epub.metadata?.description || "",
          cover: epub.metadata?.cover || "",
        };

        //  Danh sách chương (lọc bớt các file không phải nội dung)
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

    //  Xóa file tạm
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log(`📘 Sách: ${bookData.metadata.title}`);
    console.log(`📄 Tổng số chương hợp lệ: ${bookData.chapters.length}`);

    return bookData;
  } catch (error) {
    console.error("❌ Lỗi parse EPUB:", error);
    throw error;
  }
}