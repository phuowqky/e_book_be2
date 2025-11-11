
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch"; // cần nếu Node < 18
import dotenv from "dotenv";
import { getBooksByGenres } from "../../modules/books/bookService.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getBookRecommendation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body; // nội dung người dùng gửi

    //Lấy thông tin user profile
    let favoriteGenres = [];

    try {
      const profileResponse = await fetch(`${process.env.BASE_URL}/api/recommendations/${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        favoriteGenres = profileData.favoriteGenres || [];
      } else {
        console.warn("Profile user trả về lỗi:", profileResponse.status);
      }
    } catch (err) {
      console.warn("Lỗi fetch profile user:", err.message);
    }

    if (!favoriteGenres.length)
      favoriteGenres = ["Tâm lý học", "Kỹ năng sống", "Tiểu thuyết"];

    //Lấy danh sách sách trong DB (theo thể loại yêu thích)
    const booksFromDB = await getBooksByGenres(favoriteGenres);

    //Tạo text danh sách sách để cung cấp cho AI
    const bookListText = booksFromDB
      .map(
        (b, idx) => `${idx + 1}. ${b.title} (${b.category}) - ${b.author}
Tóm tắt: ${b.description || "Chưa có mô tả."}`
      )
      .join("\n");

    //Prompt
    const prompt = `
Bạn là một trợ lý đọc sách thân thiện và hiểu biết sâu rộng.

Thông tin bạn có:
- Các thể loại yêu thích của người dùng: ${favoriteGenres.join(", ")}
- Dưới đây là danh sách một số sách có trong cơ sở dữ liệu nội bộ:
${bookListText || "Chưa có sách trong cơ sở dữ liệu."}

Nhiệm vụ của bạn:
Nếu người dùng hỏi xin gợi ý sách nên đọc → chỉ chọn sách có trong danh sách DB phù hợp với thể loại hoặc chủ đề câu hỏi. Nếu câu hỏi chung chung, gợi ý ngẫu nhiên trong DB.
Nếu người dùng hỏi về nội dung, nhân vật, tác giả, ý nghĩa, chủ đề... → bạn có thể trả lời bằng kiến thức chung (không cần trong DB).
Nếu người dùng hỏi về sách không có trong DB → vẫn có thể trả lời dựa trên hiểu biết tổng quát.
Khi gợi ý, chỉ sử dụng tên sách có trong DB, KHÔNG bịa thêm sách mới.
Giữ phong cách nói tự nhiên, giống như đang trò chuyện thân mật với người đọc.

Người dùng hỏi: "${message}"
`;

    //Gọi Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const answer =
      response.output_text || response.text || "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

    res.status(200).json({
      success: true,
      message: "Trợ lý trả lời thành công",
      data: answer,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi gọi Gemini",
      error: error.message,
    });
  }
};
