// backend/controllers/authController.js
const db = require('../config/db'); // File cấu hình db dùng .promise()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res) => {
    const { fullname, email, password, role } = req.body;
    try {
        // 1. Hash mật khẩu (10 vòng lặp)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.execute(
            'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)',
            [fullname, email, hashedPassword, role || 'customer']
        );
        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Chỉ tìm user bằng email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            const user = rows[0]; // FIX: Khai báo biến user lấy từ database
            
            // 2. Dùng bcrypt để so sánh mật khẩu chữ thường với mật khẩu mã hóa trong DB
            const match = await bcrypt.compare(password, user.password);
            
            if (match) {
                // 3. FIX: Tạo lại JWT Token để gửi về cho Frontend
                const token = jwt.sign(
                    { id: user.id, fullname: user.fullname, role: user.role }, 
                    JWT_SECRET, 
                    { expiresIn: '1d' }
                );
                
                res.json({
                    message: "Đăng nhập thành công",
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        city: user.city,
                        role: user.role,
                        avatar: user.avatar
                    },
                    token: token // Phải trả cái này về thì frontend mới lưu được
                });
            } else {
                res.status(401).json({ message: "Mật khẩu không đúng" });
            }
        } else {
            res.status(401).json({ message: "Email không tồn tại" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
  const { fullname, phone, address, city } = req.body;
  const { id } = req.params;

  try {
    await db.execute(
      `UPDATE users SET fullname=?, phone=?, address=?, city=? WHERE id=?`,
      [fullname, phone, address, city, id]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};