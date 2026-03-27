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
import ProductDetail from './pages/Client/ProductDetail'; // Trang mới
import Cart from './pages/Client/Cart';
import Checkout from './pages/Client/Checkout';
import Success from './pages/Client/Success'; 
import MyOrders from './pages/Client/MyOrders';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. NHÓM GIAO DIỆN KHÁCH HÀNG 
            Tất cả các trang này sẽ có Header và Footer chung từ CustomerLayout
        */}
        <Route path="/" element={<CustomerLayout />}>
          {/* path="/" index: Trang chủ hiển thị mặc định */}
          <Route index element={<Home />} /> 

          <Route path="product/:id" element={<ProductDetail />} />

          <Route path="cart" element={<Cart />} />

          {/* path="/login": Trang đăng nhập của khách */}
          <Route path="login" element={<Auth />} />

          <Route path="checkout" element={<Checkout />} />

          <Route path="success" element={<Success />} />
          
          <Route path="my-orders" element={<MyOrders />} />

          {/* Sau này bạn có thể thêm: 
              <Route path="products" element={<ProductList />} /> 
          */}
        </Route>

        {/* 2. NHÓM GIAO DIỆN ADMIN 
            Tất cả các trang này sẽ có Sidebar chung từ AdminLayout
        */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* path="/admin/dashboard" */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* path="/admin/products" */}
          <Route path="products" element={<ProductManagement />} />
          
          {/* path="/admin/orders" */}
          <Route path="orders" element={<OrderManagement />} />
          
          {/* path="/admin/categories" */}
          <Route path="categories" element={<CategoryManagement />} />
        </Route>

        {/* Route phụ dành cho login admin nếu cần link riêng biệt */}
        <Route path="/admin/login" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;