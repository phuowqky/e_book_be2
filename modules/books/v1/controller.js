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
import { htmlToText } from "html-to-text";


// Lấy danh sách sách
export async function getBooks(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find({ status: 'Mở' })
      .populate('createdBy', 'userName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ status: 'Mở' });

    res.json({
      success: true, data: books, pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
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

    //  Upload cover image lên Cloudinary
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

    //  Upload EPUB file lên Supabase Storage
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

    //  Lưu sách vào DB
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

    //  Trả về response
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

    // Tải file EPUB trực tiếp từ Supabase
    const { data, error } = await supabase.storage
      .from("ebook_storage1")
      .download(`epub-files/${fileName}`);

    if (error || !data) {
      console.error("❌ Supabase download error:", error);
      return res.status(404).json({ success: false, message: "Không tìm thấy file trên Supabase" });
    }

    //  Đọc stream thành buffer
    const chunks = [];
    for await (const chunk of data.stream()) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    //  Gửi về đúng định dạng EPUB
    res.setHeader("Content-Type", "application/epub+zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);

    console.log(`📘 EPUB "${fileName}" tải về thành công (${buffer.length} bytes)`);
  } catch (error) {
    console.error(" Error downloading EPUB:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export const uploadBook = async (req, res) => {
  try {
    const { title, author, epubUrl, category, language } = req.body;
    if (!epubUrl) throw new Error("Thiếu link EPUB");

    //  Parse EPUB trước để lấy metadata và chapters
    const parsedData = await parseEpubAndSave(epubUrl);

    //  Kiểm tra sách đã tồn tại chưa
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

    //  Lưu danh sách chapter
    if (parsedData.chapters?.length) {
      const chapters = parsedData.chapters.map((chap) => ({
        bookId: book._id,
        title: chap.title,
        index: chap.index,
        // href: chap.href,
        content: ch.content
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
        status: "Mở",
      });
    }

    // Lưu danh sách chương
    if (parsedData.chapters && parsedData.chapters.length > 0) {
      const chapters = parsedData.chapters.map((chap) => ({
        bookId: book._id,
        title: chap.title,
        index: chap.index,
        // href: chap.href,
        content: ch.content
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


export const getChapterContent = async (req, res) => {
  try {
    const { bookId, index } = req.params;

    const chapter = await Chapter.findOne({
      bookId,
      index: parseInt(index, 10),
    });

    if (!chapter)
      return res.status(404).json({ message: "Không tìm thấy chương" });

    res.json({ content: chapter.content });
  } catch (err) {
    console.error(" Lỗi getChapterContent:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi không xác định" });
  }
};


export const getListChapters = async (req, res) => {
  try {
    const { bookId } = req.params;

    //  Kiểm tra đầu vào hợp lệ
    if (!bookId) {
      return res.status(400).json({ success: false, message: "Thiếu bookId trong yêu cầu" });
    }

    //  Kiểm tra bookId có phải ObjectId hợp lệ không
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(bookId);
    if (!isObjectId) {
      return res.status(400).json({ success: false, message: "bookId không hợp lệ" });
    }

    //  Tìm sách theo ID
    const book = await Book.findById(bookId).select("title author");
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }

    //  Lấy danh sách chapter, chỉ lấy trường cần thiết
    const chapters = await Chapter.find({ bookId })
      .sort({ index: 1 })
      .select("index title href");

    //  Kiểm tra có dữ liệu hay không
    if (!chapters.length) {
      return res.status(404).json({
        success: false,
        message: "Sách này chưa có chương nào được lưu"
      });
    }

    //  Trả về dữ liệu
    res.status(200).json({
      success: true,
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
      },
      totalChapters: chapters.length,
      chapters,
    });

  } catch (err) {
    console.error(" Lỗi getListChapters:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
      error: err.message,
    });
  }
};



export const uploadChaptersForBook = async (req, res) => {
  try {
    const { title, epubUrl } = req.body;
    if (!title || !epubUrl) {
      return res.status(400).json({
        success: false,
        message: "Phải truyền cả title và epubUrl",
      });
    }

    //  Kiểm tra sách tồn tại theo title
    let book = await Book.findOne({ title });
    if (!book) {
      // Nếu chưa có thì tạo mới
      book = await Book.create({ title, epubFile: epubUrl });
    } else {
      // Nếu đã có, cập nhật epubFile
      book.epubFile = epubUrl;
      await book.save();
    }

    //  Parse EPUB
    const parsedData = await parseEpubAndSave(epubUrl);
    const { chapters } = parsedData;

    if (!chapters || chapters.length === 0) {
      return res.status(400).json({ success: false, message: "Không có chương hợp lệ" });
    }


    const chaptersToInsert = chapters.map((ch, idx) => ({
      bookId: book._id,
      index: idx,
      title: ch.title || `Chương ${idx}`,

      content: ch.content || "",
    }));

    //  Xóa chương cũ của sách nếu có
    await Chapter.deleteMany({ bookId: book._id });

    // Lưu chương mới
    await Chapter.insertMany(chaptersToInsert);

    res.status(200).json({
      success: true,
      message: `Lưu thành công ${chaptersToInsert.length} chương của sách "${book.title}"`,
      bookId: book._id,
      totalChapters: chaptersToInsert.length,
    });

  } catch (err) {
    console.error(" Lỗi uploadChaptersForBook:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




export const getChapterByIndex = async (req, res) => {
  try {
    const { bookId, index } = req.params;

    //  Tìm sách theo _id
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }

    //  Tìm chương theo bookId và index
    const chapter = await Chapter.findOne({ bookId: book._id, index: parseInt(index, 10) });
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chương" });
    }

    //  Trả về content
    res.status(200).json({
      success: true,
      bookTitle: book.title,
      chapterIndex: chapter.index,
      chapterTitle: chapter.title,
      content: chapter.content,
    });

  } catch (err) {
    console.error("Lỗi getChapterByIndex:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


