# 🔐 HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG HỆ THỐNG XÁC THỰC

## 📋 MỤC LỤC
1. [Tính năng đã triển khai](#tính-năng-đã-triển-khai)
2. [Cấu trúc API](#cấu-trúc-api)
3. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
4. [Tài khoản test](#tài-khoản-test)
5. [Ghi chú](#ghi-chú)

---

## ✅ TÍNH NĂNG ĐÃ TRIỂN KHAI

### Backend
- ✅ **Hash Password**: Sử dụng `bcryptjs` (12 salt rounds)
- ✅ **JWT Authentication**: Token-based authentication với expiry 7 ngày
- ✅ **Authorization Middleware**: Role-based access control (admin/customer)
- ✅ **Profile Management**: CRUD operations cho user profile
- ✅ **Change Password**: Đổi mật khẩu an toàn
- ✅ **Forgot Password**: (Simplified version - gửi email placeholder)
- ✅ **Environment Variables**: `.env` file cho cấu hình bảo mật

### Frontend
- ✅ **Auth Pages**: Login, Register, Forgot Password (separate routes)
- ✅ **Profile Page**: View & edit user profile
- ✅ **Auth Interceptor**: Axios interceptor tự động thêm JWT token vào request
- ✅ **Auth State Management**: localStorage + authApi functions
- ✅ **Protected Routes**: Redirect chưa authenticate user
- ✅ **User Menu**: Dropdown menu với Profile, Orders, Logout

### Bảo mật
- ✅ Password hashed với bcryptjs
- ✅ JWT tokens với expiry
- ✅ Authorization checks trên tất cả admin endpoints
- ✅ User chỉ xem được đơn hàng của chính mình
- ✅ CORS protection
- ✅ Parameterized queries (MongoDB injection prevention)

---

## 🔌 CẤU TRÚC API

### Authentication Routes

#### Đăng ký
```
POST /api/auth/register
Content-Type: application/json

{
  "fullname": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Đăng ký thành công!",
  "userId": 1
}
```

#### Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullname": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Quên mật khẩu
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."
}
```

### Profile Routes (Require Authentication)

#### Lấy profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": 1,
    "fullname": "Admin User",
    "email": "admin@example.com",
    "phone": "0123456789",
    "address": "Hà Nội",
    "role": "admin"
  }
}
```

#### Cập nhật profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "Tên mới",
  "email": "newemail@example.com",
  "phone": "0987654321",
  "address": "Địa chỉ mới"
}

Response:
{
  "message": "Cập nhật profile thành công",
  "user": { ... }
}
```

#### Đổi mật khẩu
```
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newpassword123"
}

Response:
{
  "message": "Đổi mật khẩu thành công"
}
```

### Protected Admin Routes

Tất cả endpoints dưới đây yêu cầu:
- `Authorization: Bearer <token>`
- User role phải là `admin`

#### Products
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

#### Categories
- `POST /api/categories` - Tạo danh mục
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

#### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng (admin only)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

---

## 📖 HƯỚNG DẪN SỬ DỤNG

### Khởi động hệ thống

#### 1. Backend
```bash
cd backend
npm install
npm start
```
Server chạy tại: `http://localhost:5000`

#### 2. Frontend
```bash
cd web-frontend
npm install
npm run dev
```
App chạy tại: `http://localhost:5175`

### Frontend Routes

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ |
| `/auth/login` | Đăng nhập |
| `/auth/register` | Đăng ký |
| `/auth/forgot-password` | Quên mật khẩu |
| `/profile` | Thông tin cá nhân |
| `/product/:id` | Chi tiết sản phẩm |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/my-orders` | Đơn hàng của tôi |
| `/admin/dashboard` | Admin dashboard |

### Cách sử dụng authApi

```javascript
// Login
import { login, logout, getProfile, updateProfile } from './api/authApi';

// Đăng nhập
const response = await login({
  email: 'admin@example.com',
  password: 'admin123'
});
// Token tự động lưu vào localStorage

// Lấy profile
const profile = await getProfile();

// Cập nhật profile
await updateProfile({
  fullname: 'Tên mới',
  phone: '0987654321',
  address: 'Địa chỉ mới'
});

// Đăng xuất
logout();

// Kiểm tra authentication
import { isAuthenticated, getCurrentUser } from './api/authApi';
if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log(user.fullname);
}
```

### Sử dụng Authorization Middleware

Tất cả endpoints admin đã được bảo vệ bằng middleware. Khi gọi từ frontend:

```javascript
// axios interceptor tự động thêm token
import axios from 'axios';

const response = await axios.post('/api/products', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
// Token tự động được thêm vào Authorization header
```

---

## 👤 TÀI KHOẢN TEST

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: admin
```

### Customer Account
```
Email: customer@example.com
Password: admin123
Role: customer
```

---

## 📝 CẤU TRÚC THƯ MỤC

### Backend
```
backend/
├── middleware/
│   └── auth.js              # JWT verify & role-based authorization
├── controllers/
│   └── authController.js    # Authentication & profile logic
├── config/
│   └── db.js               # Database connection
├── .env                     # Environment variables
├── server.js               # Main server file
└── package.json
```

### Frontend
```
web-frontend/src/
├── api/
│   ├── authApi.js          # Auth functions with axios interceptor
│   └── productApi.js       # Product API functions
├── pages/
│   ├── Client/
│   │   ├── Auth.jsx        # Login/Register/ForgotPassword
│   │   ├── Profile.jsx     # Profile management
│   │   └── ...
│   └── Admin/
│       └── ...
├── components/
│   └── layout/
│       └── Header/
│           └── index.jsx   # User menu integration
├── App.jsx
└── main.jsx
```

---

## 🔒 BẢO MẬT - LƯU Ý QUAN TRỌNG

### Development
- ✅ `.env` file không commit vào git
- ✅ Mật khẩu ngắn được phép cho testing (6+ ký tự)
- ✅ CORS cho localhost:3000 và localhost:5173

### Production
- ⚠️ Đổi `JWT_SECRET` trong `.env`
- ⚠️ Sử dụng HTTPS không HTTP
- ⚠️ Bật HTTPS enforce
- ⚠️ Sử dụng environment variables cho database config
- ⚠️ Implement rate limiting trên login endpoint
- ⚠️ Add email verification trên forgot password
- ⚠️ Implement password reset token với expiry
- ⚠️ Add 2FA (Two-Factor Authentication)

---

## 🐛 TROUBLESHOOTING

### Backend Error: "Token không hợp lệ"
- Kiểm tra token trong request header: `Authorization: Bearer <token>`
- Token hết hạn? Cần đăng nhập lại

### Frontend 401 Unauthorized
- Kiểm tra localStorage có `token` không
- Token còn hạn lại không?
- Role có đủ quyền không?

### CORS Error
- Backend CORS config kiểm tra `/backend/server.js` line 14
- Frontend API_URL khớp với backend không?

### Password Hash Error
- Kiểm tra bcryptjs version: `npm list bcryptjs`
- Hash rounds: 12 (balance giữa security & performance)

---

## 📚 THAM KHẢO

- [BCryptjs Docs](https://github.com/dcodeIO/bcrypt.js)
- [JWT Docs](https://jwt.io)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---

## ❓ CÂU HỎI THƯỜNG GẶP

**Q: Mật khẩu được hash bao nhiêu lần?**
A: 12 lần (cài đặt mặc định bcryptjs). Balance tốt giữa security & performance.

**Q: JWT token hết hạn sau bao lâu?**
A: 7 ngày. Config trong authController.js `{ expiresIn: '7d' }`

**Q: Làm sao thay đổi JWT secret?**
A: Chỉnh sửa `JWT_SECRET` trong `.env` file.

**Q: Có cách nào refresh token không?**
A: Hiện tại chưa implement. Có thể thêm refresh token endpoint.

---

✅ **HOÀN THÀNH** - Hệ thống authentication, authorization, và profile management đã sẵn sàng sử dụng!
