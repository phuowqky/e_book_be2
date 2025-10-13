import Book from '../../../models/book.js';
import cloudinary from '../../../config/cloudinary.js';
import streamifier from "streamifier";
import { supabase } from '../../../config/supabase.js';
import { parseEpubAndSave } from "./utils/epubParser.js";
import Chapter from "../../../modules/chapters/v1/chapters_model.js"; 
import pkg from "epub2";
const EPub = pkg.default || pkg;
import path from "path";
import fs from "fs";
import os from "os";   
// Lấy danh sách sách
export async function getBooks(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page -1) * limit;
        
        const books = await Book.find({ status: 'active' })
            .populate('createdBy', 'userName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Book.countDocuments({ status: 'active' });

        res.json({ success: true, data: books, pagination:{
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        } });
    } catch (error) {
        res.status(200).json({ success: false, message: error.message });
    }
}

// Lấy chi tiết sách
export async function getBookById(req, res) {
    try {
        const book = await Book.findById(req.params.id)
            .populate('createdBy', 'userName email');
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createBook(req, res) {
  try {
    const { title, author, description, category, tags, publishYear, isbn, totalPages, language } = req.body;

    let coverImage = '';
    let epubFile = '';
    let epubFileName = '';
    let epubFileSize = 0;

    // 1️⃣ Upload cover image lên Cloudinary
    if (req.files && req.files.coverImage) {
      const uploadCoverImage = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'book-covers',
              transformation: [
                { width: 400, height: 600, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(req.files.coverImage[0].buffer).pipe(stream);
        });

      const result = await uploadCoverImage();
      coverImage = result.secure_url;
    }

    // 2️⃣ Upload EPUB file lên Supabase Storage
    if (req.files && req.files.epubFile) {
      const epubFileData = req.files.epubFile[0];
      // Tạo fileName thực tế có timestamp để tránh trùng
      const fileNameOnSupabase = `epub-files/${Date.now()}-${epubFileData.originalname}`;

      const { data, error } = await supabase.storage
        .from('ebook_storage1')
        .upload(fileNameOnSupabase, epubFileData.buffer, {
          contentType: epubFileData.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Lấy public URL
      const { data: urlData } = supabase.storage
        .from('ebook_storage1')
        .getPublicUrl(fileNameOnSupabase);

      epubFile = urlData.publicUrl;
      epubFileName = fileNameOnSupabase.split('/').pop(); // Lưu tên file thực tế
      epubFileSize = epubFileData.size;
    }

    // 3️⃣ Lưu sách vào DB
    const book = new Book({
      title,
      author,
      description,
      coverImage,
      epubFile,
      epubFileName,
      epubFileSize,
      category,
      tags: tags ? tags.split(',') : [],
      publishYear,
      isbn,
      totalPages,
      language,
      createdBy: req.user.id
    });

    await book.save();

    // 4️⃣ Trả về response
    res.status(201).json({
      success: true,
      data: book,
      message: 'Tạo sách thành công'
    });

  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}


// Cập nhật sách
export async function updateBook(req, res) {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Xóa sách (soft delete)
export async function deleteBook(req, res) {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
        }
        
        res.json({ success: true, message: 'Đã xóa sách thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function downloadEpub(req, res) {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ success: false, message: "fileName không được để trống" });
    }

    // ✅ Tải file EPUB trực tiếp từ Supabase
    const { data, error } = await supabase.storage
      .from("ebook_storage1")
      .download(`epub-files/${fileName}`);

    if (error || !data) {
      console.error("❌ Supabase download error:", error);
      return res.status(404).json({ success: false, message: "Không tìm thấy file trên Supabase" });
    }

    // ✅ Đọc stream thành buffer
    const chunks = [];
    for await (const chunk of data.stream()) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // ✅ Gửi về đúng định dạng EPUB
    res.setHeader("Content-Type", "application/epub+zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);

    console.log(`📘 EPUB "${fileName}" tải về thành công (${buffer.length} bytes)`);
  } catch (error) {
    console.error("💥 Error downloading EPUB:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const uploadBook = async (req, res) => {
  try {
    const { title, author, epubUrl, category, language } = req.body;
    if (!epubUrl) throw new Error("Thiếu link EPUB");

    // 1️⃣ Parse EPUB trước để lấy metadata và chapters
    const parsedData = await parseEpubAndSave(epubUrl);

    // 2️⃣ Kiểm tra sách đã tồn tại chưa
    let book = await Book.findOne({ title });
    if (!book) {
      book = await Book.create({
        title: title || parsedData.metadata.title,
        author: author || parsedData.metadata.author,
        description: parsedData.metadata.description,
        coverImage: parsedData.metadata.cover,
        epubFile: epubUrl,
        epubFileName: parsedData.metadata.filename || "",
        category: category || "Chưa phân loại",
        language: language || "Unknown",
        status: "active",
      });
    }

    // 3️⃣ Lưu danh sách chapter
    if (parsedData.chapters?.length) {
      const chapters = parsedData.chapters.map((chap) => ({
        bookId: book._id,
        title: chap.title,
        index: chap.index,
        href: chap.href,
      }));
      await Chapter.insertMany(chapters);
    }

    res.status(200).json({
      success: true,
      message: "Upload & parse EPUB thành công",
      bookId: book._id,
      parsedData,
    });
  } catch (err) {
    console.error("💥 Lỗi uploadBook:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const uploadBook = async (req, res) => {
//   try {
//     const { title, author, epubUrl, category, language } = req.body;

//     // Parse EPUB trước để lấy metadata và chapters
//     const parsedData = await parseEpubAndSave(epubUrl);

//     // Check sách đã tồn tại theo title
//     let book = await Book.findOne({ title });

//     if (!book) {
//       // Nếu chưa có thì tạo mới
//       book = await Book.create({
//         title,
//         author: author || parsedData.metadata.creator,
//         description: parsedData.metadata.description,
//         coverImage: parsedData.metadata.cover,
//         epubFile: epubUrl,
//         epubFileName: parsedData.metadata.filename || "",
//         category: category || "Chưa phân loại",
//         language: language || "Unknown",
//         status: "active",
//       });
//     }

//     // Lưu chapters vào collection Chapter
//     if (parsedData.chapters && parsedData.chapters.length > 0) {
//       const chapters = parsedData.chapters.map((chap) => ({
//         bookId: book._id,
//         title: chap.title,
//         index: chap.index,
//         href: chap.href,
//       }));
//       await Chapter.insertMany(chapters);
//     }

//     res.status(200).json({
//       success: true,
//       message: "Upload & parse thành công",
//       bookId: book._id,
//       parsedData,
//     });
//   } catch (err) {
//     console.error("💥 Lỗi uploadBook:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



export const uploadEpub = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Không có file EPUB" });

    const epubPath = path.join("uploads", file.filename);

    // Parse EPUB
    const parsedData = await parseEpub(epubPath);

    // Check sách đã tồn tại theo title
    let book = await Book.findOne({ title: parsedData.metadata.title });

    if (!book) {
      // Nếu chưa có thì tạo mới
      book = await Book.create({
        title: parsedData.metadata.title,
        author: parsedData.metadata.creator,
        description: parsedData.metadata.description,
        coverImage: parsedData.metadata.cover,
        epubFile: epubPath,
        epubFileName: file.filename,
        category: req.body.category || "Chưa phân loại",
        language: req.body.language || "Unknown",
        status: "active",
      });
    }

    // Lưu danh sách chương
    if (parsedData.chapters && parsedData.chapters.length > 0) {
      const chapters = parsedData.chapters.map((chap) => ({
        bookId: book._id,
        title: chap.title,
        index: chap.index,
        href: chap.href,
      }));
      await Chapter.insertMany(chapters);
    }

    res.json({
      success: true,
      message: "Upload & parse thành công",
      bookId: book._id,
      parsedData,
    });
  } catch (error) {
    console.error("Lỗi upload EPUB:", error);
    res.status(500).json({ message: "Lỗi khi upload hoặc parse EPUB" });
  }
};



// export const getChapterContent = async (req, res) => {
//   try {
//     const { bookId, index } = req.params;

//     const book = await Book.findById(bookId);
//     if (!book) return res.status(404).json({ message: "Book not found" });

//     // 1️⃣ Tải file EPUB về tạm
//     const response = await fetch(book.epubFile);
//     if (!response.ok) throw new Error("Không tải được file EPUB từ URL");

//     const buffer = Buffer.from(await response.arrayBuffer());
//     // const tempPath = path.join("temp", `temp-${Date.now()}.epub`);
//     const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
//     fs.writeFileSync(tempPath, buffer);

//     // 2️⃣ Parse EPUB
//     const epub = new EPub(tempPath);
//     const chapterContent = await new Promise((resolve, reject) => {
//       epub.on("end", () => {
//         const chapterIndex = parseInt(index, 10);
//         const chapter = epub.flow[chapterIndex];
//         if (!chapter) return reject({ status: 404, message: "Chapter not found" });

//         epub.getChapter(chapter.id, (err, text) => {
//           if (err) return reject(err);
//           resolve(text);
//         });
//       });

//       epub.on("error", reject);
//       epub.parse();
//     });

//     // 3️⃣ Xóa file tạm
//     fs.unlinkSync(tempPath);

//     res.json({ content: chapterContent });
//   } catch (err) {
//     console.error("Lỗi getChapterContent:", err);
//     if (err.status) {
//       res.status(err.status).json({ message: err.message });
//     } else {
//       res.status(500).json({ message: err.message });
//     }
//   }
// };

export const getChapterContent = async (req, res) => {
  try {
    const { bookId, index } = req.params;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    // 1️⃣ Tải EPUB tạm
    const response = await fetch(book.epubFile);
    if (!response.ok) throw new Error("Không tải được EPUB từ URL");

    const buffer = Buffer.from(await response.arrayBuffer());
    const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}.epub`);
    fs.writeFileSync(tempPath, buffer);

    // 2️⃣ Lấy thông tin chương từ DB
    const chapterRecord = await Chapter.findOne({
      bookId,
      index: parseInt(index, 10),
    });
    if (!chapterRecord)
      return res.status(404).json({ message: "Không tìm thấy chương" });

    // 3️⃣ Parse EPUB & đọc chương theo href
    const epub = new EPub(tempPath);

    const chapterContent = await new Promise((resolve, reject) => {
      epub.on("end", () => {
        epub.getChapterRaw(chapterRecord.href, (err, text) => {
          if (err) return reject(err);
          resolve(text);
        });
      });

      epub.on("error", reject);
      epub.parse();
    });

    // 4️⃣ Xóa file tạm
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    res.json({ content: chapterContent });
  } catch (err) {
    console.error("💥 Lỗi getChapterContent:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi không xác định" });
  }
};

export const getListChapters = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Kiểm tra sách tồn tại
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    // Lấy danh sách chapter trong MongoDB
    // (vì bạn đã lưu vào collection Chapter khi parse EPUB)
    const chapters = await Chapter.find({ bookId }).sort({ index: 1 }).select("index title href");

    if (!chapters || chapters.length === 0) {
      return res.status(404).json({ success: false, message: "No chapters found for this book" });
    }

    res.json({
      success: true,
      bookId,
      total: chapters.length,
      data: chapters
    });
  } catch (err) {
    console.error("💥 Lỗi getListChapters:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};