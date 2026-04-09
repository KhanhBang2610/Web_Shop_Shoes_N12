const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Thêm thư viện cho Socket.io
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
// 1.5 CẤU HÌNH SOCKET.IO
// ==========================================
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('⚡ Có client kết nối Socket:', socket.id);
});

// ==========================================
// 2. KẾT NỐI DATABASE (Pool Connection)
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
// 3. CẤU HÌNH UPLOAD FILE (Multer) BẢO MẬT
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        else cb(new Error('Chỉ cho phép tải lên hình ảnh!'));
    }
});

// ==========================================
// 4. HỆ THỐNG API
// ==========================================

// ---> GỌI ĐÚNG CONTROLLER TẠI ĐÂY (ĐÃ XÓA CODE LOGIN CŨ) <---
app.use('/api', require('./routes/api'));       // Gọi authController (Đăng nhập, Đăng ký)
app.use('/api/user', require('./routes/user')); // Gọi userController (Profile)

// Import middleware auth
const { authenticate, authorize } = require('./middleware/auth');


// --- [PRODUCT] QUẢN LÝ SẢN PHẨM ---
app.get('/api/products', (req, res) => {
    let sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id";
    let params = [];
    
    // Filter theo category_id nếu có query string
    const categoryId = req.query.category_id;
    if (categoryId) {
        sql += " WHERE p.category_id = ?";
        params.push(categoryId);
    }
    
    sql += " ORDER BY p.id DESC";
    
    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy danh sách sản phẩm",
                details: err.message
            });
        }
        const products = results.map(product => ({
            ...product,
            discount: Number(product.discount) || 0,
            original_price: Number(product.price),
            discounted_price: Number(product.discount) > 0 ? Number(product.price) * (1 - Number(product.discount) / 100) : Number(product.price)
        }));
        res.status(200).json({
            success: true,
            data: products,
            count: products.length
        });
    });
});

// --- [PROMOTIONS] SẢN PHẨM KHUYẾN MÃI ---
app.get('/api/promotions', (req, res) => {
    const sql = "SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.discount > 0 ORDER BY p.id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy danh sách sản phẩm khuyến mãi",
                details: err.message
            });
        }
        
        // Tính giá khuyến mãi
        const promotions = results.map(product => ({
            ...product,
            discounted_price: Number(product.price) * (1 - Number(product.discount) / 100),
            original_price: Number(product.price),
            discount: Number(product.discount) || 0
        }));
        
        res.status(200).json({
            success: true,
            data: promotions,
            count: promotions.length
        });
    });
});

app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    // Validate ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID sản phẩm không hợp lệ"
        });
    }
    
    db.query("SELECT * FROM products WHERE id = ?", [productId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy thông tin sản phẩm",
                details: err.message
            });
        }
        
        if (!results[0]) {
            return res.status(404).json({
                success: false,
                code: "PRODUCT_NOT_FOUND",
                message: "Không tìm thấy sản phẩm"
            });
        }
        
        const product = results[0];
        const discount = Number(product.discount) || 0;
        const original_price = Number(product.price);
        const discounted_price = discount > 0 ? original_price * (1 - discount / 100) : original_price;
        
        res.status(200).json({
            success: true,
            data: {
                ...product,
                original_price,
                discounted_price,
                discount
            }
        });
    });
});

app.post('/api/products', authenticate, authorize('admin'), upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Tên sản phẩm không được để trống"
        });
    }
    
    if (!price || isNaN(price) || price <= 0) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Giá sản phẩm phải là số dương"
        });
    }
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : '';
    
    const sql = "INSERT INTO products (name, price, description, image_url, category_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name.trim(), Number(price), description || '', image_url, category_id || null], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể tạo sản phẩm mới",
                details: err.message
            });
        }
        
        res.status(201).json({
            success: true,
            code: "PRODUCT_CREATED",
            message: "Thêm sản phẩm thành công",
            data: { id: result.insertId }
        });
    });
});

app.put('/api/products/:id', authenticate, authorize('admin'), upload.single('image'), (req, res) => {
    const { name, price, description, category_id } = req.body;
    const productId = req.params.id;
    
    // Validate ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID sản phẩm không hợp lệ"
        });
    }
    
    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Tên sản phẩm không được để trống"
        });
    }
    
    if (!price || isNaN(price) || price <= 0) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Giá sản phẩm phải là số dương"
        });
    }
    
    let sql = "UPDATE products SET name=?, price=?, description=?, category_id=? WHERE id=?";
    let params = [name.trim(), Number(price), description || '', category_id, productId];

    if (req.file) {
        sql = "UPDATE products SET name=?, price=?, description=?, image_url=?, category_id=? WHERE id=?";
        params = [name.trim(), Number(price), description || '', `/uploads/${req.file.filename}`, category_id, productId];
    }
    
    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể cập nhật sản phẩm",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "PRODUCT_NOT_FOUND",
                message: "Không tìm thấy sản phẩm để cập nhật"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "PRODUCT_UPDATED",
            message: "Cập nhật sản phẩm thành công"
        });
    });
});

app.delete('/api/products/:id', authenticate, authorize('admin'), (req, res) => {
    const productId = req.params.id;
    
    // Validate ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID sản phẩm không hợp lệ"
        });
    }
    
    db.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể xóa sản phẩm",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "PRODUCT_NOT_FOUND",
                message: "Không tìm thấy sản phẩm để xóa"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "PRODUCT_DELETED",
            message: "Xóa sản phẩm thành công"
        });
    });
});

// --- [VARIANT] QUẢN LÝ SIZE SẢN PHẨM ---
app.get('/api/products/:id/variants', (req, res) => {
    const productId = req.params.id;
    
    // Validate ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID sản phẩm không hợp lệ"
        });
    }
    
    db.query("SELECT id, size, stock_quantity FROM product_variants WHERE product_id = ?", [productId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy thông tin size sản phẩm",
                details: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

// --- [CATEGORY] QUẢN LÝ DANH MỤC ---
app.get('/api/categories', (req, res) => {
    db.query("SELECT * FROM categories", (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy danh sách danh mục",
                details: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

app.post('/api/categories', authenticate, authorize('admin'), (req, res) => {
    const { name, description } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Tên danh mục không được để trống"
        });
    }
    
    db.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name.trim(), description || ''], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể tạo danh mục mới",
                details: err.message
            });
        }
        
        res.status(201).json({
            success: true,
            code: "CATEGORY_CREATED",
            message: "Thêm danh mục thành công",
            data: { id: result.insertId }
        });
    });
});

app.put('/api/categories/:id', authenticate, authorize('admin'), (req, res) => {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    // Validate ID
    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID danh mục không hợp lệ"
        });
    }
    
    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Tên danh mục không được để trống"
        });
    }
    
    db.query("UPDATE categories SET name = ?, description = ? WHERE id = ?", [name.trim(), description || '', categoryId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể cập nhật danh mục",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "CATEGORY_NOT_FOUND",
                message: "Không tìm thấy danh mục để cập nhật"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "CATEGORY_UPDATED",
            message: "Cập nhật danh mục thành công"
        });
    });
});

app.delete('/api/categories/:id', authenticate, authorize('admin'), (req, res) => {
    const categoryId = req.params.id;
    
    // Validate ID
    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID danh mục không hợp lệ"
        });
    }
    
    db.query("DELETE FROM categories WHERE id = ?", [categoryId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể xóa danh mục",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "CATEGORY_NOT_FOUND",
                message: "Không tìm thấy danh mục để xóa"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "CATEGORY_DELETED",
            message: "Xóa danh mục thành công"
        });
    });
});

// --- [DISCOUNT] QUẢN LÝ GIẢM GIÁ SẢN PHẨM ---
app.put('/api/products/:id/discount', authenticate, authorize('admin'), (req, res) => {
    const { discount } = req.body;
    const productId = req.params.id;
    
    // Validate ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID sản phẩm không hợp lệ"
        });
    }
    
    const discountValue = Number(discount) || 0;
    
    if (discountValue < 0 || discountValue > 100) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Phần trăm giảm giá phải từ 0 đến 100"
        });
    }
    
    db.query("UPDATE products SET discount = ? WHERE id = ?", [discountValue, productId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể cập nhật giảm giá",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "PRODUCT_NOT_FOUND",
                message: "Không tìm thấy sản phẩm để cập nhật giảm giá"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "DISCOUNT_UPDATED",
            message: "Cập nhật giảm giá thành công"
        });
    });
});

// --- [ORDER] QUẢN LÝ ĐƠN HÀNG (ADMIN & USER) ---
app.get('/api/orders', authenticate, authorize('admin'), (req, res) => {
    const sql = "SELECT o.*, u.fullname as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy danh sách đơn hàng",
                details: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

app.get('/api/orders/user/:userId', authenticate, (req, res) => {
    const userId = req.params.userId;
    
    // Validate userId
    if (!userId || isNaN(userId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID người dùng không hợp lệ"
        });
    }
    
    // Check if user can access this data (own orders or admin)
    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            code: "FORBIDDEN",
            message: "Không có quyền xem đơn hàng của người dùng khác"
        });
    }
    
    db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC", [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy danh sách đơn hàng",
                details: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

app.get('/api/orders/:id/details', authenticate, (req, res) => {
    const orderId = req.params.id;
    
    // Validate ID
    if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID đơn hàng không hợp lệ"
        });
    }
    
    // First check if order exists and user has permission
    db.query("SELECT user_id FROM orders WHERE id = ?", [orderId], (err, orderResult) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể kiểm tra đơn hàng",
                details: err.message
            });
        }
        
        if (orderResult.length === 0) {
            return res.status(404).json({
                success: false,
                code: "ORDER_NOT_FOUND",
                message: "Không tìm thấy đơn hàng"
            });
        }
        
        // Check permission
        if (orderResult[0].user_id != req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                code: "FORBIDDEN",
                message: "Không có quyền xem chi tiết đơn hàng này"
            });
        }
        
        // Get order details
        const sql = `SELECT od.*, p.name AS product_name, p.image_url 
                     FROM order_details od
                     JOIN product_variants pv ON od.product_variants_id = pv.id
                     JOIN products p ON pv.product_id = p.id
                     WHERE od.order_id = ?`;
        
        db.query(sql, [orderId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    code: "DATABASE_ERROR",
                    message: "Không thể lấy chi tiết đơn hàng",
                    details: err.message
                });
            }
            
            res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });
        });
    });
});

app.put('/api/orders/:id/status', authenticate, authorize('admin'), (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    
    // Validate ID
    if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
            success: false,
            code: "INVALID_ID",
            message: "ID đơn hàng không hợp lệ"
        });
    }
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Trạng thái đơn hàng không hợp lệ",
            validStatuses: validStatuses
        });
    }
    
    db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể cập nhật trạng thái đơn hàng",
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                code: "ORDER_NOT_FOUND",
                message: "Không tìm thấy đơn hàng để cập nhật"
            });
        }
        
        res.status(200).json({
            success: true,
            code: "ORDER_STATUS_UPDATED",
            message: "Cập nhật trạng thái đơn hàng thành công"
        });
    });
});

// --- [CHECKOUT] XỬ LÝ THANH TOÁN ---
app.post('/api/orders/checkout', authenticate, async (req, res) => {
    const { user_id, total_money, shipping_address, phone, details } = req.body;
    
    // Validate user_id matches authenticated user
    if (user_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            code: "FORBIDDEN",
            message: "Không thể đặt hàng cho người dùng khác"
        });
    }
    
    // Validation
    if (!total_money || isNaN(total_money) || total_money <= 0) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Tổng tiền phải là số dương"
        });
    }
    
    if (!shipping_address || !shipping_address.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Địa chỉ giao hàng không được để trống"
        });
    }
    
    if (!phone || !phone.trim()) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Số điện thoại không được để trống"
        });
    }
    
    if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Chi tiết đơn hàng không được để trống"
        });
    }
    
    try {
        const sqlOrder = "INSERT INTO orders (user_id, total_money, shipping_address, phone, status, order_date) VALUES (?, ?, ?, ?, 'pending', NOW())";
        const [orderResult] = await dbPromise.query(sqlOrder, [user_id, total_money, shipping_address.trim(), phone.trim()]);
        const orderId = orderResult.insertId;

        if (details && details.length > 0) {
            for (const item of details) {
                // Validate each item
                if (!item.product_id || !item.size || !item.quantity || !item.price) {
                    throw new Error("Chi tiết sản phẩm không đầy đủ");
                }
                
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
        
        res.status(201).json({
            success: true,
            code: "ORDER_CREATED",
            message: "Đặt hàng thành công!",
            data: { orderId }
        });

    } catch (error) {
        console.error("LỖI SQL CHECKOUT:", error.message);
        res.status(500).json({
            success: false,
            code: "CHECKOUT_ERROR",
            message: "Lỗi hệ thống khi thanh toán",
            details: error.message
        });
    }
});

// --- [ADMIN] THỐNG KÊ DASHBOARD ---
app.get('/api/admin/status', authenticate, authorize('admin'), (req, res) => {
    const sql = `SELECT 
        (SELECT COUNT(*) FROM products) as totalProducts,
        (SELECT COUNT(*) FROM orders) as totalOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pendingOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'shipped') as shippingOrders,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as completedOrders,
        (SELECT IFNULL(SUM(total_money), 0) FROM orders WHERE status != 'canceled') as totalRevenue`;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                code: "DATABASE_ERROR",
                message: "Không thể lấy thống kê",
                details: err.message
            });
        }
        
        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
});

// ==========================================
// 5. KHỞI CHẠY SERVER
// ==========================================
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server + Socket.io đang chạy tại: http://localhost:${PORT}`);
    console.log(`📂 Ảnh upload lưu tại: /uploads/`);
    console.log(`=========================================`);
});

// Phong fixed this
