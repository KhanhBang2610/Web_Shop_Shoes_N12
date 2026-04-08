// backend/controllers/userController.js
const db = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        // req.user được lấy từ middleware auth.js
        const [rows] = await db.execute('SELECT id, fullname, email, phone, address, city, role, avatar FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });
        res.json({ user: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const connection = await db.getConnection(); // Lấy connection cho Transaction
    try {
        await connection.beginTransaction(); // BẮT ĐẦU TRANSACTION

        const { fullname, phone, address, city } = req.body;
        let avatarUrl = req.body.existing_avatar || null; // Giữ avatar cũ nếu ko upload

        // Upload(++) - Xử lý file ảnh avatar
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        // Thực thi Update
        await connection.execute(
            'UPDATE users SET fullname = ?, phone = ?, address = ?, city = ?, avatar = ? WHERE id = ?',
            [fullname, phone || null, address || null, city || null, avatarUrl, req.user.id]
        );

        await connection.commit(); // HOÀN TẤT TRANSACTION

        // Gửi thông báo realtime qua Socket.io
        if (req.io) {
            req.io.emit('profile_updated', { 
                userId: req.user.id, 
                message: `User ${fullname} vừa cập nhật profile!` 
            });
        }

        res.json({ message: "Cập nhật thành công", avatar: avatarUrl });
    } catch (error) {
        await connection.rollback(); // HỦY BỎ NẾU CÓ LỖI (TRANSACTION)
        res.status(500).json({ error: error.message });
    } finally {
        connection.release(); // Trả connection lại cho pool
    }
};