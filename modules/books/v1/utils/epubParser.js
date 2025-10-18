


import fs from "fs";
import path from "path";
import os from "os";
import pkg from "epub2"; // sử dụng epub2
const EPub = pkg.default || pkg;

/**
 * Parse EPUB từ URL và trả về metadata + danh sách chapters
 * @param {string} epubUrl - URL EPUB public
 */
export async function parseEpubAndSave(epubUrl) {
  try {
    console.log(" Đang tải EPUB từ:", epubUrl);

    //  Tải file EPUB từ URL
    const response = await fetch(epubUrl);
    if (!response.ok) throw new Error("Không tải được file EPUB từ URL.");

    const buffer = Buffer.from(await response.arrayBuffer());
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
    fs.writeFileSync(tempPath, buffer);

    console.log(" EPUB tải xong, bắt đầu parse...");

    //  Parse EPUB
    const epub = new EPub(tempPath);

    const bookData = await new Promise((resolve, reject) => {
      epub.on("end", async () => {
        const metadata = {
          title: epub.metadata?.title || "Không rõ tiêu đề",
          author: epub.metadata?.creator || "Không rõ tác giả",
          description: epub.metadata?.description || "",
        };

        const chapters = [];
        let chapterIndex = 0;

        //  Duyệt toàn bộ flow, bỏ qua href lỗi và các item không phải chương
        for (let i = 0; i < epub.flow.length; i++) {
          const ch = epub.flow[i];

          // Bỏ qua các href hoặc title liên quan đến cover, toc, nav, info
          if (!ch.href || /cover|toc|nav|info|thong_tin|title|copyright|acknowledg/i.test(ch.href)) {
            continue;
          }

          const content = await new Promise((res) => {
            try {
              epub.getChapter(ch.id, (err, text) => {
                if (err) {
                  console.warn(` Bỏ qua chương lỗi: ${ch.href || ch.id}`);
                  return res("");
                }
                res(text || "");
              });
            } catch (e) {
              console.warn(` Bỏ qua chương lỗi (exception): ${ch.href || ch.id}`);
              res("");
            }
          });

          if (!content.trim()) continue;

          chapters.push({
            index: chapterIndex++, // tăng index chỉ khi có chương hợp lệ
            title: ch.title ? ch.title.trim() : `Chương ${chapterIndex}`,
            content,
            href: ch.href,
          });
        }

        resolve({ metadata, chapters });
      });

      epub.on("error", reject);
      epub.parse();
    });

    //  Xóa file tạm
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    console.log(` Sách: ${bookData.metadata.title}`);
    console.log(` Tổng số chương parse được: ${bookData.chapters.length}`);

    return bookData;
  } catch (error) {
    console.error(" Lỗi parse EPUB:", error);
    throw error;
  }
}