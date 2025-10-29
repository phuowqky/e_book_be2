import Banner from "../../models/banner.js";
import cloudinary from "../../config/cloudinary.js";

//  Thêm banner (upload ảnh lên Cloudinary)
export const createBanner = async (req, res) => {
  try {
    const { title, link, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh banner",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "banners" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: "Upload ảnh thất bại",
            error: error.message,
          });
        }

        // Lưu thông tin banner vào MongoDB
        const banner = await Banner.create({
          title,
          imageUrl: result.secure_url,
          link,
          isActive: isActive ?? true,
        });

        res.status(200).json({
          success: true,
          message: "Tạo banner thành công",
          data: banner,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  Lấy danh sách banner (bình thường)
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách banner thành công",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  Xóa toàn bộ banner (nếu muốn làm mới slider)
export const deleteAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();

    // Xóa ảnh trên Cloudinary
    for (const banner of banners) {
      const publicId = banner.imageUrl.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Banner.deleteMany();

    res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ banner",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
