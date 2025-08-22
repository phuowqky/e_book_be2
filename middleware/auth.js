import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(200).json({
            success: false,
            message: 'Không có token xác thực hoặc định dạng sai',
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(200).json({
            success: false,
            message: 'Token không hợp lệ',
        });
    }

    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn',
            });
        }
        req.user = decoded;
        next();
    });
}