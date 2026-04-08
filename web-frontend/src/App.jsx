import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages Admin
import Dashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import DiscountManagement from './pages/Admin/DiscountManagement';

// Pages Client
import Auth from './pages/Client/Auth';
import Home from './pages/Client/Home';
import Brands from './pages/Client/Brands';
import ProductDetail from './pages/Client/ProductDetail';
import Cart from './pages/Client/Cart';
import Checkout from './pages/Client/Checkout';
import Success from './pages/Client/Success';
import MyOrders from './pages/Client/MyOrders';
import PurchaseHistory from './pages/Client/PurchaseHistory';
import Profile from './pages/Client/Profile';
import Promotions from './pages/Client/Promotions';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <Routes>
          {/* AUTH riêng (không layout) */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />

          {/* ================= CLIENT ================= */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="brands" element={<Brands />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<Success />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="purchase-history" element={<PurchaseHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="promotions" element={<Promotions />} />
          </Route>

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="discounts" element={<DiscountManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
          </Route>

          {/* Admin login riêng */}
          <Route path="/admin/login" element={<Auth />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;