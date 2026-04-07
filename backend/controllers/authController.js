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
<<<<<<< HEAD
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json({
                message: "Đăng nhập thành công",
                user: { 
                    id: user.id, 
                    email: user.email, 
                    fullname: user.fullname, 
                    role: user.role 
                }
            });
=======
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            // 2. So sánh mật khẩu đã hash
            const match = await bcrypt.compare(password, user.password);
            
            if (match) {
                // 3. Tạo Token chứa thông tin user
                const token = jwt.sign(
                    { id: user.id, fullname: user.fullname, role: user.role }, 
                    JWT_SECRET, 
                    { expiresIn: '1d' } // Token sống 1 ngày
                );
                
                res.json({
                    message: "Đăng nhập thành công",
                    user: { id: user.id, fullname: user.fullname, role: user.role, avatar: user.avatar },
                    token: token
                });
            } else {
                res.status(401).json({ message: "Mật khẩu không đúng" });
            }
>>>>>>> 9eb5109a66d68cb26697e7aeea24c4ee8fc433f2
        } else {
            res.status(401).json({ message: "Email không tồn tại" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};