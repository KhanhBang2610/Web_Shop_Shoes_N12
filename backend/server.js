const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- THÊM THƯ VIỆN CHO SOCKET.IO ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// ==========================================
// 1. CẤU HÌNH MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

// ==========================================
// 1.5 CẤU HÌNH SOCKET.IO (MỚI)
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Truyền io vào request để Controller có thể dùng gọi thông báo realtime
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('⚡ Có client kết nối Socket:', socket.id);
    socket.on('disconnect', () => console.log('Client ngắt kết nối Socket'));
});

// ==========================================
// 2. KẾT NỐI DATABASE (Giữ nguyên cho các API cũ)
// ==========================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234', 
    database: 'web_shoes',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ LỖI KẾT NỐI DATABASE: ', err.message);
    } else {
        console.log('✅ DATABASE ĐÃ KẾT NỐI THÀNH CÔNG!');
        connection.release();
    }
});

const dbPromise = db.promise();

// ==========================================
// 3. CẤU HÌNH UPLOAD FILE (Multer)
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn đúng 2MB ở backend
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận các đuôi ảnh này
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép tải lên hình ảnh!'));
        }
    }
});

// ==========================================
// 4. HỆ THỐNG API
// ==========================================

// --- [USER & AUTH] GỌI TỪ CONTROLLER MỚI TẠO ---
// (Đã xóa 2 API login/register cũ ở đây)
app.use('/api', require('./routes/api'));       // Gọi file routes/api.js (chứa login, register)
app.use('/api/user', require('./routes/user')); // Gọi file routes/user.js (chứa profile)


// --- [PRODUCT] QUẢN LÝ SẢN PHẨM ---
app.get('/api/products', (req, res) => {
    const sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.query("SELECT * FROM products WHERE id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : '';
    const sql = "INSERT INTO products (name, price, description, image_url, category_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, price, description, image_url, category_id || null], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Thêm sản phẩm thành công", id: result.insertId });
    });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    let sql = "UPDATE products SET name=?, price=?, description=?, category_id=? WHERE id=?";
    let params = [name, price, description, category_id, req.params.id];

    if (req.file) {
        sql = "UPDATE products SET name=?, price=?, description=?, image_url=?, category_id=? WHERE id=?";
        params = [name, price, description, `/uploads/${req.file.filename}`, category_id, req.params.id];
    }
    db.query(sql, params, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Cập nhật sản phẩm thành công" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Xóa sản phẩm thành công" });
    });
});

// --- [VARIANT] QUẢN LÝ SIZE SẢN PHẨM ---
app.get('/api/products/:id/variants', (req, res) => {
    db.query("SELECT id, size, stock_quantity FROM product_variants WHERE product_id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- [CATEGORY] QUẢN LÝ DANH MỤC ---
app.get('/api/categories', (req, res) => {
    db.query("SELECT * FROM categories", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    db.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Thêm danh mục thành công", id: result.insertId });
    });
});

app.put('/api/categories/:id', (req, res) => {
    const { name, description } = req.body;
    db.query("UPDATE categories SET name = ?, description = ? WHERE id = ?", [name, description, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Cập nhật danh mục thành công" });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Xóa danh mục thành công" });
    });
});

// --- [ORDER] QUẢN LÝ ĐƠN HÀNG (ADMIN & USER) ---

app.get('/api/orders', (req, res) => {
    const sql = "SELECT o.*, u.fullname as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/orders/user/:userId', (req, res) => {
    db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC", [req.params.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/orders/:id/details', (req, res) => {
    const sql = `SELECT od.*, p.name AS product_name, p.image_url 
                 FROM order_details od
                 JOIN product_variants pv ON od.product_variants_id = pv.id
                 JOIN products p ON pv.product_id = p.id
                 WHERE od.order_id = ?`;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Cập nhật trạng thái đơn hàng thành công!" });
    });
});

// --- [CHECKOUT] XỬ LÝ THANH TOÁN ---
app.post('/api/orders/checkout', async (req, res) => {
    const { user_id, total_money, shipping_address, phone, details } = req.body;
    try {
        const sqlOrder = "INSERT INTO orders (user_id, total_money, shipping_address, phone, status, order_date) VALUES (?, ?, ?, ?, 'pending', NOW())";
        const [orderResult] = await dbPromise.query(sqlOrder, [user_id, total_money, shipping_address, phone]);
        const orderId = orderResult.insertId;

        if (details && details.length > 0) {
            for (const item of details) {
                const [variants] = await dbPromise.query(
                    "SELECT id FROM product_variants WHERE product_id = ? AND size = ?", 
                    [item.product_id, item.size]
                );

                let vId = variants.length > 0 ? variants[0].id : null;
                
                if (!vId) {
                    const [defaultV] = await dbPromise.query("SELECT id FROM product_variants WHERE product_id = ? LIMIT 1", [item.product_id]);
                    vId = defaultV[0]?.id;
                }

                if (vId) {
                    await dbPromise.query(
                        "INSERT INTO order_details (order_id, product_variants_id, quantity, price) VALUES (?, ?, ?, ?)",
                        [orderId, vId, item.quantity, item.price]
                    );
                }
            }
        }
        res.json({ success: true, message: "Đặt hàng thành công!", orderId });

    } catch (error) {
        console.error("LỖI SQL CHECKOUT:", error.message);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi thanh toán: " + error.message });
    }
});

// --- [ADMIN] THỐNG KÊ DASHBOARD ---
app.get('/api/admin/status', (req, res) => {
    const sql = `SELECT 
        (SELECT COUNT(*) FROM products) as totalProducts,
        (SELECT COUNT(*) FROM orders) as totalOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pendingOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'shipped') as shippingOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as completedOrders,
        (SELECT IFNULL(SUM(total_money), 0) FROM orders WHERE status != 'canceled') as totalRevenue`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// ==========================================
// 5. KHỞI CHẠY SERVER
// ==========================================
const PORT = 5000;
// THAY ĐỔI: Chạy bằng server.listen để kích hoạt cả Express và Socket.io
server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server + Socket.io đang chạy tại: http://localhost:${PORT}`);
    console.log(`📂 Ảnh upload lưu tại: /uploads/`);
    console.log(`=========================================`);
});