import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages Admin
import Dashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';

// Pages Client
import Auth from './pages/Client/Auth';
import Home from './pages/Client/Home';
import ProductDetail from './pages/Client/ProductDetail'; 
import Cart from './pages/Client/Cart';
import Checkout from './pages/Client/Checkout';
import Success from './pages/Client/Success'; 
import MyOrders from './pages/Client/MyOrders';
import PurchaseHistory from './pages/Client/PurchaseHistory';
import Profile from './pages/Client/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            1. NHÓM GIAO DIỆN KHÁCH HÀNG 
            Tất cả các trang này sẽ có Header và Footer chung từ CustomerLayout
        ========================================== */}
        <Route path="login" element={<Auth />} />
          <Route path="register" element={<Auth />} />
          <Route path="forgot-password" element={<Auth />} />
        <Route path="/" element={<CustomerLayout />}>
          s
          {/* Trang chủ hiển thị mặc định */}
          <Route index element={<Home />} /> 

          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="success" element={<Success />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="profile" element={<Profile />} />

          {/* Sau này bạn có thể thêm: 
              <Route path="products" element={<ProductList />} /> 
          */}
          {/* 2. THÊM ĐƯỜNG DẪN CHO TRANG PROFILE */}
          <Route path="profile" element={<Profile />} />
          <Route path="purchase-history" element={<PurchaseHistory />} />

          {/* 3. CÁC ĐƯỜNG DẪN XỬ LÝ TÀI KHOẢN (Dùng chung component Auth) */}

        </Route>

        {/* ==========================================
            2. NHÓM GIAO DIỆN ADMIN 
            Tất cả các trang này sẽ có Sidebar chung từ AdminLayout
        ========================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
        </Route>

        {/* Route phụ dành cho login admin nếu cần link riêng biệt */}
        <Route path="/admin/login" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;