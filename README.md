Sach_BE
Sach_BE là backend API cho hệ thống quản lý, chia sẻ và đánh giá sách, hỗ trợ các chức năng: xác thực, quản lý người dùng, sách, đánh dấu yêu thích, đề xuất, tiến trình đọc và nhiều hơn nữa.

🚀 Tính năng chính
Xác thực và quản lý người dùng (đăng ký, đăng nhập, phân quyền)
Quản lý sách (thêm, sửa, xoá, tìm kiếm, phân loại)
Quản lý đánh dấu (bookmark)
Đánh giá, bình luận sách
Đề xuất sách thông minh (theo lịch sử)
Theo dõi tiến độ đọc sách
Banner/trending/random book API
Tương tác thời gian thực (Pusher)
Hỗ trợ upload file (Cloudinary)

🏗️ Công nghệ sử dụng
Node.js + Express.js
MongoDB (Mongoose)
Cloudinary (upload file)
Pusher (realtime)
Supabase
AI/GenAI (gợi ý sách)
JWT (xác thực)
...và nhiều thư viện hữu ích khác

.
├── config/             # Cấu hình DB, Cloudinary,...
├── controllers/        # Controller chung cho Auth, User
├── middleware/         # Middleware (auth, ...)
├── models/             # Định nghĩa mongoose model
├── modules/            # Route + Controller cho từng module chuyên biệt
│   └── books/          # Quản lý sách
│   └── rating_book/    # Đánh giá, review sách
│   └── recommendation/ # Đề xuất sách
│   └── ...             
├── routes/             # Route tổng hợp
├── service/            # Các dịch vụ ngoài như pusher
├── ultils/             # Các hàm tiện ích
└── index.js            # Điểm khởi động server

⚡ Cài đặt & chạy local
git clone https://github.com/your-repo/sach_BE.git
cd sach_BE
npm install
cp .env.example .env        # Tạo file env và cập nhật thông số kết nối
npm start

📌 Environment cần khai báo
MONGODB_URI=...
JWT_SECRET=...
CLOUDINARY_...
PUSHER_...
SUPABASE_...
(Xem thêm trong file .env.example)