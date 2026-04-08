import React from 'react';
import { Outlet, Link } from 'react-router-dom'; // Phải có Outlet

const AdminLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#3f9ba2d0', color: 'white', padding: '20px' }}>
        <h2>SHOES ADMIN</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>📊 Dashboard</Link>
          <Link to="/admin/products" style={{ color: 'white', textDecoration: 'none' }}>👟 Quản lý sản phẩm</Link>
          <Link to="/admin/discounts" style={{ color: 'white', textDecoration: 'none' }}>💰 Quản lý giảm giá</Link>
          <Link to="/admin/orders" style={{ color: 'white', textDecoration: 'none' }}>📜 Quản lý đơn hàng</Link>         
          <Link to="/admin/categories" style={{ color: 'white', textDecoration: 'none' }}>📁 Quản lý danh mục</Link>
          
          <hr />
          <button onClick={() => window.location.href = '/login'} style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '5px', cursor: 'pointer' }}>Đăng xuất</button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px', background: '#f4f7f6' }}>
        {children}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
