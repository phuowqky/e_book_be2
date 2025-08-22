

// phần subjects này chưa tối ưu, ko lên dùng chỗ mới
// cách dùng: 
/// import { SUBJECTS } from '../config/constants.js';
export const SUBJECTS = [
    "67eac6722505122f6aa537d8",
    "123",
];

export const EDITDOCS = [
    '67eac6722505122f6aa537d8',
];
// import { ROLES } from "../config/constants.js";
export const ROLES = {
    USER: 1,           // 1: User thông thường (quyền thấp nhất)
    EDITOR: 2,         // 2: Editor/Biên tập viên
    DOCS: 5,            // tài liệu về docs
    SALE: 6,            // Saler
    TEACHER: 7,           //  Giáo viên
    OPERATE : 8,          // vận hành
    ACCOUNTER: 9,
    SUPER_ADMIN: 10     // 10: Super Admin (quyền cao nhất)
  };