# Web_Shop_Shoes_N12

## Cấu trúc web:

- frontend:
web-frontend/src/
├── assets/                  # Tài nguyên tĩnh
│   ├── images/              # Banner bộ sưu tập, Logo Brand
│   ├── icons/               # Icon thước đo, chất liệu
│   └── size-charts/         # Ảnh bảng quy đổi size (EU, US, UK)
├── api/                     # Quản lý gọi API
│   ├── productApi.js        # Lọc theo Size, Thương hiệu, Màu sắc
│   └── brandApi.js          # Lấy danh sách hãng giày
├── components/              # Thành phần giao diện
│   ├── common/              # Dùng chung (Modal, ShoeCard)
│   └── features/            # Theo nghiệp vụ (SizePicker, Tracking)
├── constants/               # Hằng số (Bảng size chuẩn 36-45)
├── hooks/                   # Custom hooks (useInventory)
└── pages/                   # Các trang chính (BrandPage, SizeGuide)

- backend
backend/
├── config/                  # Kết nối Database (MySQL)
├── controllers/             # Xử lý Logic (Product, Order)
├── models/                  # Schema dữ liệu (Product, Variant, User)
├── routes/                  # Định nghĩa API Routes
└── server.js                # Entry point

## Dowload database in terminal:   
  `npm init -y`
  `npm install express mysql2 cors`

## Dowload icon:   
  `npm install lucide-react`

## Dowload package:  
- backend:
  `cd backtend`
  `npm install`
  `npm install lucide-react react-router-dom`
- frontend:
  `cd web-frontend`
  `npm install`
  `npm install lucide-react react-router-dom`

## Run web:   
  `npm run dev`
