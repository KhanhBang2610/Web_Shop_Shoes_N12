const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            code: "MISSING_TOKEN",
            message: "Token không hợp lệ hoặc thiếu"
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, fullname, role }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            code: "INVALID_TOKEN",
            message: "Token không hợp lệ"
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: "NOT_AUTHENTICATED",
                message: "Chưa xác thực"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                code: "FORBIDDEN",
                message: "Không có quyền truy cập"
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };