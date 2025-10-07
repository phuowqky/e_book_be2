import Book from '../../../models/book.js';
import cloudinary from '../../../config/cloudinary.js';
import streamifier from "streamifier";
import { supabase } from '../../../config/supabase.js';

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

// export async function createBook(req, res) {
//     try {
//         const { title, author, description, category, tags, publishYear, isbn, totalPages, language } = req.body;

//         let coverImage = '';
//         let epubFile = '';
//         let epubFileName = '';
//         let epubFileSize = 0;

//         // Upload cover image lên Cloudinary
//         if (req.files && req.files.coverImage) {
//             const uploadCoverImage = () => {
//                 return new Promise((resolve, reject) => {
//                     const stream = cloudinary.uploader.upload_stream(
//                         {
//                             folder: 'book-covers',
//                             transformation: [
//                                 { width: 400, height: 600, crop: 'fill' },
//                                 { quality: 'auto' }
//                             ]
//                         },
//                         (error, result) => {
//                             if (error) reject(error);
//                             else resolve(result);
//                         }
//                     );
//                     streamifier.createReadStream(req.files.coverImage[0].buffer).pipe(stream);
//                 });
//             };

//             const result = await uploadCoverImage();
//             coverImage = result.secure_url;
//         }

//         // Upload EPUB file lên Supabase Storage
//         if (req.files && req.files.epubFile) {
//             const epubFileData = req.files.epubFile[0];
//             const fileName = `epub-files/${Date.now()}-${epubFileData.originalname}`;
            
//             try {
//                 const { data, error } = await supabase.storage
//                     .from('ebook_storage1') // Tên bucket mới
//                     .upload(fileName, epubFileData.buffer, {
//                         contentType: epubFileData.mimetype,
//                         cacheControl: '3600',
//                         upsert: false
//                     });

//                 if (error) {
//                     throw error;
//                 }

//                 // Lấy public URL
//                 const { data: urlData } = supabase.storage
//                     .from('ebook_storage1') // Tên bucket mới
//                     .getPublicUrl(fileName);

//                 epubFile = urlData.publicUrl;
//                 epubFileName = epubFileData.originalname;
//                 // epubFileName: data.path.split('/').pop(), 
//                 epubFileSize = epubFileData.size;
//             } catch (error) {
//                 console.error('Error uploading to Supabase:', error);
//                 return res.status(500).json({ 
//                     success: false, 
//                     message: 'Lỗi upload file EPUB: ' + error.message 
//                 });
//             }
//         }

//         const book = new Book({
//             title,
//             author,
//             description,
//             coverImage,
//             epubFile,
//             epubFileName,
//             epubFileSize,
//             category,
//             tags: tags ? tags.split(',') : [],
//             publishYear,
//             isbn,
//             totalPages,
//             language,
//             createdBy: req.user.id
//         });

//         await book.save();
//         res.status(201).json({
//             success: true,
//             data: book,
//             message: 'Tạo sách thành công'
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }

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
      return res.status(400).json({ success: false, message: 'fileName không được để trống' });
    }

    // Lấy URL public từ Supabase
    const { data: urlData, error: urlError } = supabase.storage
      .from('ebook_storage1') // tên bucket
      .getPublicUrl(`epub-files/${fileName}`);

    if (urlError || !urlData.publicUrl) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file trên Supabase' });
    }

    // Fetch file từ Supabase
    const response = await fetch(urlData.publicUrl);
    if (!response.ok) {
      return res.status(404).json({ success: false, message: 'Không tải được file EPUB' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading EPUB:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}