// Hàm chuyển đổi thời gian sang múi giờ Việt Nam (UTC+7)

// import { toVietnamTime  } from "../ultils/timeUtils.js"
// sử dụng
// const currentTime = new Date();
// const vietnamCurrentTime = toVietnamTime(currentTime); // Trả về đối tượng Date

export const toVietnamTime = (date) => {
    const vietnamOffset = 7 * 60; // UTC+7 in minutes
    const utcDate = new Date(date);
    const vietnamTime = new Date(utcDate.getTime() + vietnamOffset * 60 * 1000);
    return vietnamTime; // Trả về đối tượng Date
};

// Có thể thêm các hàm tiện ích khác liên quan đến thời gian
// Ví dụ: Hàm chuyển đổi thời gian về UTC
export const toUTCTime = (date) => {
    return new Date(date.toISOString()); // Trả về đối tượng Date ở UTC
};