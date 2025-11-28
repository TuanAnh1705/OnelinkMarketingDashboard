// hashPassword.js
const bcrypt = require('bcrypt');

// Số vòng lặp salt
const saltRounds = 12;

// Lấy mật khẩu từ đối số dòng lệnh thứ 3
const password = process.argv[2];

// 1. Kiểm tra
if (!password) {
  console.error("Lỗi: Vui lòng nhập mật khẩu cần hash.");
  console.log("Cách dùng: node hashPassword.js \"password_của_bạn\"");
  process.exit(1); 
}

// 2. Hàm async để hash
async function hashPassword() {
  try {
    // 3. Thực hiện hash
    const hash = await bcrypt.hash(password, saltRounds);

    // 4. In hash ra
    console.log(hash);
  } catch (error) {
    console.error("Lỗi khi hash mật khẩu:", error);
    process.exit(1);
  }
}

// 5. Chạy hàm
hashPassword();