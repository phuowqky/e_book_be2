import bcrypt from "bcryptjs";
import validator from "validator";
import User from "../models/user.js";

import jwt from "jsonwebtoken"; // Thêm import jwt
import dotenv from "dotenv"; // Thêm import dotenv

dotenv.config(); // Cấu hình dotenv

export async function register(req, res) {
    try {
        const { phone, userName, email, password, confirmPassword } = req.body;

        // Kiểm tra thiếu trường
        if (!phone || !userName || !email || !password || !confirmPassword) {
            return res.status(200).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Kiểm tra email hợp lệ
        if (!validator.isEmail(email)) {
            return res.status(200).json({
                success: false,
                message: "Invalid email format."
            });
        }



        // Kiểm tra mật khẩu trùng khớp
        if (password !== confirmPassword) {
            return res.status(200).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        // Kiểm tra email hoặc số điện thoại đã tồn tại
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(200).json({
                success: false,
                message: "Email or phone already registered."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu user
        const newUser = await User.create({
            phone,
            userName,
            email,
            // yearOfBirth,
            password: hashedPassword
        });

        // Trả kết quả
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: newUser._id,
                phone: newUser.phone,
                userName: newUser.userName,
                email: newUser.email,
                // yearOfBirth: newUser.yearOfBirth
            }
        });
    } catch (err) {
        console.error("❌ Lỗi khi đăng ký:", err);
        return res.status(500).json({
            success: false,
            message: "Server error: " + err.message
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Kiểm tra thiếu trường
        if (!email || !password) {
            return res.status(200).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc."
            });
        }

        // Kiểm tra email hợp lệ
        if (!validator.isEmail(email)) {
            return res.status(200).json({
                success: false,
                message: "Định dạng email không hợp lệ."
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng."
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(200).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng."
            });
        }

        // Tạo JWT token
        const payload = {
            userId: user._id,
            email: user.email,
            userName: user.userName,
            role: user.role || 1 // Mặc định role USER nếu không có
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token hết hạn sau 7 ngày
        });

        // Trả kết quả thành công
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                token,
                user: {
                    id: user._id,
                    phone: user.phone,
                    userName: user.userName,
                    email: user.email,
                    // yearOfBirth: user.yearOfBirth,
                    role: user.role || 1
                }
            }
        });

    } catch (err) {
        console.error(" Lỗi khi đăng nhập:", err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server: " + err.message
        });
    }
}

export async function updateAccount(req, res) {
  try {
    const userId = req.userId;
    const { userName, phone, email, avt } = req.body;

    // Kiểm tra rỗng
    if (!userName || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "userName, phone và email là bắt buộc."
      });
    }

    // Kiểm tra email hợp lệ
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ."
      });
    }

    // Kiểm tra email hoặc phone đã tồn tại ở user khác
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc số điện thoại đã được sử dụng."
      });
    }

    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, phone, email, avt },
      { new: true, runValidators: true }
    ).select("-password"); // Không trả mật khẩu

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updatedUser
    });

  } catch (err) {
    console.error(" Lỗi cập nhật thông tin:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message
    });
  }
}

export async function getAccount(req, res) {
  try {
    const userId = req.userId; // Lấy từ middleware verifyToken

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập. Vui lòng đăng nhập."
      });
    }

    // Tìm user theo ID, ẩn password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công",
      data: user
    });

  } catch (err) {
    console.error(" Lỗi lấy thông tin tài khoản:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server: " + err.message
    });
  }
}