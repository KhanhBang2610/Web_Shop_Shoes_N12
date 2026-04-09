// backend/controllers/authController.js
const db = require('../config/db'); // File cấu hình db dùng .promise()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// LƯU Ý: Nhớ thay YOUR_GOOGLE_CLIENT_ID bằng mã thật của bạn ở 2 chỗ trong file này nhé!
const client = new OAuth2Client('677343040491-ef2q2ntd7h9sgntmnebqoj32aqv04fr2.apps.googleusercontent.com');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const register = async (req, res) => {
    const { fullname, email, password, role } = req.body;
    try {
        // 1. Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Thực hiện chèn người dùng mới
        const [result] = await db.execute(
            'INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)',
            [fullname, email, hashedPassword, role || 'customer']
        );

        // 3. Lấy ID vừa tạo để tạo Token cho User mới
        const userId = result.insertId;
        const userRole = role || 'customer';

        const token = jwt.sign(
            { id: userId, fullname: fullname, role: userRole },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 4. Trả về thông tin user và token để Frontend đăng nhập luôn
        res.status(201).json({
            success: true,
            code: "REGISTER_SUCCESS",
            message: "Đăng ký và đăng nhập thành công!",
            data: {
                user: {
                    id: userId,
                    fullname: fullname,
                    email: email,
                    role: userRole,
                    avatar: null // User mới chưa có avatar
                },
                token: token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            code: "REGISTER_ERROR",
            message: "Lỗi hệ thống khi đăng ký",
            details: error.message
        });
    }
}; // <-- ĐÃ THÊM DẤU ĐÓNG HÀM NÀY

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Chỉ tìm user bằng email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            const user = rows[0];

            // 2. Dùng bcrypt để so sánh mật khẩu chữ thường với mật khẩu mã hóa trong DB
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                // 3. Tạo lại JWT Token để gửi về cho Frontend
                const token = jwt.sign(
                    { id: user.id, fullname: user.fullname, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                res.json({
                    success: true,
                    code: "LOGIN_SUCCESS",
                    message: "Đăng nhập thành công",
                    data: {
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
                        token: token
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    code: "INVALID_PASSWORD",
                    message: "Mật khẩu không đúng"
                });
            }
        } else {
            res.status(401).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "Email không tồn tại"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            code: "LOGIN_ERROR",
            message: "Lỗi hệ thống khi đăng nhập",
            details: error.message
        });
    }
}; // <-- ĐÃ THÊM DẤU ĐÓNG HÀM NÀY

const updateProfile = async (req, res) => {
    const { fullname, phone, address, city } = req.body;
    const { id } = req.params;
    try {
        await db.execute(
            `UPDATE users SET fullname=?, phone=?, address=?, city=? WHERE id=?`,
            [fullname, phone, address, city, id]
        );

        res.json({
            success: true,
            code: "PROFILE_UPDATED",
            message: "Cập nhật thành công"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            code: "UPDATE_PROFILE_ERROR",
            message: "Lỗi hệ thống khi cập nhật profile",
            details: err.message
        });
    }
};

const googleLogin = async (req, res) => {
    const { credential } = req.body; // Token gửi từ React lên

    try {
        // 1. Xác thực Token với Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: '677343040491-ef2q2ntd7h9sgntmnebqoj32aqv04fr2.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();

        // Thông tin Google trả về
        const { email, name, picture } = payload;

        // 2. Kiểm tra xem user này đã có trong database chưa
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            // TRƯỜNG HỢP 1: User đã tồn tại -> Trả về thông tin đăng nhập luôn
            const existingUser = rows[0];

            // Tạo JWT Token 
            const token = jwt.sign(
                { id: existingUser.id, fullname: existingUser.fullname, role: existingUser.role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                success: true,
                code: "GOOGLE_LOGIN_SUCCESS",
                message: "Đăng nhập Google thành công",
                data: {
                    user: {
                        id: existingUser.id,
                        fullname: existingUser.fullname,
                        email: existingUser.email,
                        phone: existingUser.phone,
                        address: existingUser.address,
                        city: existingUser.city,
                        role: existingUser.role,
                        avatar: existingUser.avatar
                    },
                    token: token
                }
            });
        } else {
            // TRƯỜNG HỢP 2: User chưa tồn tại -> Thêm mới vào MySQL
            // Tạo một mật khẩu ngẫu nhiên và băm nó ra để bảo mật
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedRandomPassword = await bcrypt.hash(randomPassword, 10);

            const [insertResult] = await db.execute(
                'INSERT INTO users (fullname, email, avatar, role, password) VALUES (?, ?, ?, ?, ?)',
                [name, email, picture, 'customer', hashedRandomPassword]
            );

            const newUser = {
                id: insertResult.insertId,
                fullname: name,
                email: email,
                avatar: picture,
                role: 'customer'
            };

            // Tạo JWT Token cho user mới
            const token = jwt.sign(
                { id: newUser.id, fullname: newUser.fullname, role: newUser.role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                success: true,
                code: "GOOGLE_REGISTER_SUCCESS",
                message: "Tạo tài khoản bằng Google thành công",
                data: {
                    user: newUser,
                    token: token
                }
            });
        }
    } catch (error) {
        console.error("Lỗi Google Auth:", error);
        res.status(401).json({
            success: false,
            code: "GOOGLE_AUTH_ERROR",
            message: "Xác thực Google thất bại",
            details: error.message
        });
    }
};

module.exports = { register, login, updateProfile, googleLogin };