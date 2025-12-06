
// import { GoogleGenAI } from "@google/genai";
// import fetch from "node-fetch"; // cần nếu Node < 18
// import dotenv from "dotenv";
// import { getBooksByGenres } from "../../modules/books/bookService.js";

// dotenv.config();

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // export const getBookRecommendation = async (req, res) => {
// //   try {
// //     const { userId } = req.params;
// //     const { message } = req.body; // nội dung người dùng gửi

// //     //Lấy thông tin user profile
// //     let favoriteGenres = [];

// //     try {
// //       const profileResponse = await fetch(`${process.env.BASE_URL}/api/recommendations/${userId}`);
// //       if (profileResponse.ok) {
// //         const profileData = await profileResponse.json();
// //         favoriteGenres = profileData.favoriteGenres || [];
// //       } else {
// //         console.warn("Profile user trả về lỗi:", profileResponse.status);
// //       }
// //     } catch (err) {
// //       console.warn("Lỗi fetch profile user:", err.message);
// //     }

// //     if (!favoriteGenres.length)
// //       favoriteGenres = ["Tâm lý học", "Kỹ năng sống", "Tiểu thuyết"];

// //     //Lấy danh sách sách trong DB (theo thể loại yêu thích)
// //     const booksFromDB = await getBooksByGenres(favoriteGenres);

// //     //Tạo text danh sách sách để cung cấp cho AI
// //     const bookListText = booksFromDB
// //       .map(
// //         (b, idx) => `${idx + 1}. ${b.title} (${b.category}) - ${b.author}
// // Tóm tắt: ${b.description || "Chưa có mô tả."}`
// //       )
// //       .join("\n");

// //     //Prompt
// //     const prompt = `
// // Bạn là một trợ lý đọc sách thân thiện và hiểu biết sâu rộng.

// // Thông tin bạn có:
// // - Các thể loại yêu thích của người dùng: ${favoriteGenres.join(", ")}
// // - Dưới đây là danh sách một số sách có trong cơ sở dữ liệu nội bộ:
// // ${bookListText || "Chưa có sách trong cơ sở dữ liệu."}

// // Nhiệm vụ của bạn:
// // Nếu người dùng hỏi xin gợi ý sách nên đọc → chỉ chọn sách có trong danh sách DB phù hợp với thể loại hoặc chủ đề câu hỏi. Nếu câu hỏi chung chung, gợi ý ngẫu nhiên trong DB.
// // Nếu người dùng hỏi về nội dung, nhân vật, tác giả, ý nghĩa, chủ đề... → bạn có thể trả lời bằng kiến thức chung (không cần trong DB).
// // Nếu người dùng hỏi về sách không có trong DB → vẫn có thể trả lời dựa trên hiểu biết tổng quát.
// // Khi gợi ý, chỉ sử dụng tên sách có trong DB, KHÔNG bịa thêm sách mới.
// // Giữ phong cách nói tự nhiên, giống như đang trò chuyện thân mật với người đọc.

// // Người dùng hỏi: "${message}"
// // `;

// //     //Gọi Gemini
// //     const response = await ai.models.generateContent({
// //       model: "gemini-2.5-flash",
// //       contents: [{ role: "user", parts: [{ text: prompt }] }],
// //     });

// //     const answer =
// //       response.output_text || response.text || "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

// //     res.status(200).json({
// //       success: true,
// //       message: "Trợ lý trả lời thành công",
// //       data: answer,
// //     });
// //   } catch (error) {
// //     console.error("Gemini Error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Lỗi khi gọi Gemini",
// //       error: error.message,
// //     });
// //   }
// // };




// export const getBookRecommendation = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { message } = req.body; // nội dung người dùng gửi

//     //Lấy thông tin user profile
//     let favoriteGenres = [];

//     try {
//       const profileResponse = await fetch(`${process.env.BASE_URL}/api/recommendations/${userId}`);
//       if (profileResponse.ok) {
//         const profileData = await profileResponse.json();
//         favoriteGenres = profileData.booksFromDB || [];
//       } else {
//         console.warn("Profile user trả về lỗi:", profileResponse.status);
//       }
//     } catch (err) {
//       console.warn("Lỗi fetch profile user:", err.message);
//     }

//     if (!favoriteGenres.length)
//       favoriteGenres = ["Tâm lý học", "Kỹ năng sống", "Tiểu thuyết"];

//     //Lấy danh sách sách trong DB (theo thể loại yêu thích)
//     const booksFromDB = await getBooksByGenres(favoriteGenres);

//     //Tạo text danh sách sách để cung cấp cho AI
//     const bookListText = booksFromDB
//       .map(
//         (b, idx) => `${idx + 1}. ${b.title} (${b.category}) - ${b.author}
// Tóm tắt: ${b.description || "Chưa có mô tả."}`
//       )
//       .join("\n");

//     //Prompt
//     const prompt = `
// Bạn là một trợ lý đọc sách thân thiện và hiểu biết sâu rộng.

// Thông tin bạn có:
// - Các thể loại yêu thích của người dùng: ${favoriteGenres.join(", ")}
// - Dưới đây là danh sách một số sách có trong cơ sở dữ liệu nội bộ:
// ${bookListText || "Chưa có sách trong cơ sở dữ liệu."}

// Nhiệm vụ của bạn:
// Nếu người dùng hỏi xin gợi ý sách nên đọc → chỉ chọn sách có trong danh sách DB phù hợp với thể loại hoặc chủ đề câu hỏi. Nếu câu hỏi chung chung, gợi ý ngẫu nhiên trong DB.
// Nếu người dùng hỏi về nội dung, nhân vật, tác giả, ý nghĩa, chủ đề... → bạn có thể trả lời bằng kiến thức chung (không cần trong DB).
// Nếu người dùng hỏi về sách không có trong DB → vẫn có thể trả lời dựa trên hiểu biết tổng quát.
// Khi gợi ý, chỉ sử dụng tên sách có trong DB, KHÔNG bịa thêm sách mới.
// Giữ phong cách nói tự nhiên, giống như đang trò chuyện thân mật với người đọc.

// Người dùng hỏi: "${message}"
// `;

//     //Gọi Gemini
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     const answer =
//       response.output_text || response.text || "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

//     res.status(200).json({
//       success: true,
//       message: "Trợ lý trả lời thành công",
//       data: answer,
//     });
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi gọi Gemini",
//       error: error.message,
//     });
//   }
// };

// import { GoogleGenAI } from "@google/genai";
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// import {
//   getAllBooks,
//   getBooksByGenres,
//   getChaptersByBookIds
// } from "../../modules/books/bookService.js";

// dotenv.config();

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export const getBookRecommendation = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { message } = req.body;

//     /* ===============================
//        1. LẤY THỂ LOẠI YÊU THÍCH USER
//     =============================== */
//     let favoriteGenres = [];

//     try {
//       const profileResponse = await fetch(
//         `${process.env.BASE_URL}/api/recommendations/${userId}`
//       );

//       if (profileResponse.ok) {
//         const profileData = await profileResponse.json();
//         favoriteGenres = profileData.favoriteGenres || [];
//       }
//     } catch (err) {
//       console.warn("Không lấy được profile user:", err.message);
//     }

//     if (!favoriteGenres.length) {
//       favoriteGenres = ["Tâm lý học", "Kỹ năng sống", "Tiểu thuyết"];
//     }

//     /* ===============================
//        2. LẤY TOÀN BỘ SÁCH TRONG DB
//     =============================== */
//     const allBooks = await getAllBooks();

//     /* ===============================
//        3. NẾU USER HỎI THỐNG KÊ → TRẢ TRỰC TIẾP
//     =============================== */
//     if (
//       message.toLowerCase().includes("bao nhiêu sách") ||
//       message.toLowerCase().includes("tổng số sách")
//     ) {
//       return res.status(200).json({
//         success: true,
//         message: "Thống kê sách",
//         data: `Hiện tại ứng dụng có ${allBooks.length} cuốn sách.`,
//       });
//     }

//     /* ===============================
//        4. LẤY SÁCH GỢI Ý THEO THỂ LOẠI
//     =============================== */
//     const recommendedBooks = await getBooksByGenres(favoriteGenres);

//     /* ===============================
//        5. TẠO TEXT DANH SÁCH SÁCH CHO AI
//     =============================== */
//     const bookListText = recommendedBooks.length
//       ? recommendedBooks
//           .map(
//             (b, i) => `${i + 1}. ${b.title} (${b.category}) - ${b.author}
// Tóm tắt: ${b.description || "Chưa có mô tả."}`
//           )
//           .join("\n")
//       : "Hiện chưa có sách phù hợp trong cơ sở dữ liệu.";

//     /* ===============================
//        6. PROMPT CHO GEMINI
//     =============================== */
//     const prompt = `
// Bạn là một trợ lý đọc sách thân thiện và hiểu biết.

// Thông tin bạn có:
// - Tổng số sách trong hệ thống: ${allBooks.length}
// - Thể loại yêu thích của người dùng: ${favoriteGenres.join(", ")}

// Danh sách sách phù hợp trong DB:
// ${bookListText}

// Quy tắc:
// - Khi gợi ý sách: CHỈ dùng sách có trong danh sách DB ở trên.
// - Không bịa thêm sách mới.
// - Không tự suy đoán số lượng sách.
// - Trả lời tự nhiên, thân thiện.

// Người dùng hỏi: "${message}"
// `;

//     /* ===============================
//        7. GỌI GEMINI
//     =============================== */
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     const answer =
//       response.output_text ||
//       response.text ||
//       "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

//     return res.status(200).json({
//       success: true,
//       message: "Trợ lý trả lời thành công",
//       data: answer,
//     });
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Lỗi khi gọi trợ lý AI",
//       error: error.message,
//     });
//   }
// };

import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import dotenv from "dotenv";
import {
  getAllBooks,
  getBooksByGenres,
  getChaptersByBookIds,
} from "../../modules/books/bookService.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getBookRecommendation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    /* ===============================
       1. LẤY THỂ LOẠI YÊU THÍCH USER
    =============================== */
    let favoriteGenres = [];

    try {
      const profileResponse = await fetch(
        `${process.env.BASE_URL}/api/recommendations/${userId}`
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        favoriteGenres = profileData.favoriteGenres || [];
      }
    } catch (err) {
      console.warn("Không lấy được profile user:", err.message);
    }

    if (!favoriteGenres.length) {
      favoriteGenres = ["Tâm lý học", "Kỹ năng sống", "Tiểu thuyết"];
    }

    /* ===============================
       2. LẤY TOÀN BỘ SÁCH
    =============================== */
    const allBooks = await getAllBooks();

    /* ===============================
       3. CÂU HỎI THỐNG KÊ → KHÔNG QUA AI
    =============================== */
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("bao nhiêu sách") ||
      lowerMessage.includes("tổng số sách")
    ) {
      return res.status(200).json({
        success: true,
        message: "Thống kê sách",
        data: `Hiện tại ứng dụng có ${allBooks.length} cuốn sách.`,
      });
    }

    /* ===============================
       4. LẤY SÁCH THEO THỂ LOẠI
    =============================== */
    const recommendedBooks = await getBooksByGenres(favoriteGenres);

    /* ===============================
       5. LẤY CHAPTER THEO BOOK ID
    =============================== */
    const bookIds = recommendedBooks.map((b) => b._id);
    const chapters = bookIds.length
      ? await getChaptersByBookIds(bookIds)
      : [];

    /* ===============================
       6. GỘP BOOK + CHAPTER (TEXT GỬI AI)
    =============================== */
    const bookWithChaptersText = recommendedBooks.length
      ? recommendedBooks
          .map((book, index) => {
            const bookChapters = chapters.filter(
              (c) => c.bookId.toString() === book._id.toString()
            );

            const chapterList = bookChapters
              .map((c) => `  - Chương ${c.order}: ${c.title}`)
              .join("\n");

            return `
${index + 1}. ${book.title} – ${book.author}
Thể loại: ${book.category}
Số chương: ${bookChapters.length}
Danh sách chương:
${chapterList || "  (Chưa có chương)"}
`;
          })
          .join("\n")
      : "Hiện chưa có sách phù hợp trong cơ sở dữ liệu.";

    /* ===============================
       7. PROMPT CHO GEMINI
    =============================== */
    const prompt = `
Bạn là một trợ lý đọc sách thân thiện.

Thông tin hệ thống:
- Tổng số sách hiện có: ${allBooks.length}
- Thể loại yêu thích của người dùng: ${favoriteGenres.join(", ")}

Danh sách sách & chương trong DB:
${bookWithChaptersText}

QUY TẮC:
- Khi gợi ý sách hoặc chương: CHỈ dùng dữ liệu trong danh sách trên.
- Không bịa sách, không bịa chương.
- Không suy đoán số lượng.
- Không tự tưởng tượng nội dung chương khi chưa có.

Người dùng hỏi: "${message}"
`;

    /* ===============================
       8. GỌI GEMINI
    =============================== */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const answer =
      response.output_text ||
      response.text ||
      "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

    return res.status(200).json({
      success: true,
      message: "Trợ lý trả lời thành công",
      data: answer,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gọi trợ lý AI",
      error: error.message,
    });
  }
};
