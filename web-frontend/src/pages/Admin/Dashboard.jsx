import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthConfig } from '../../api/authApi';

const Dashboard = () => {
  // Bổ sung thêm các state để hứng dữ liệu mới từ Server
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    totalOrders: 0, 
    totalRevenue: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    completedOrders: 0 
  });

  useEffect(() => {
    // SỬA LỖI TẠI ĐÂY: Đổi từ /stats thành /status cho khớp với server.js
    axios.get('http://localhost:5000/api/admin/status', getAuthConfig()) 
      .then(res => setStats(res.data.data))
      .catch(err => console.log("Lỗi lấy thống kê:", err));
  }, []);

  const cardStyle = {
    background: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
    flex: 1, 
    textAlign: 'center',
    transition: 'transform 0.2s'
  };

  const titleStyle = {
    margin: '0 0 10px 0',
    color: '#7f8c8d',
    fontSize: '14px',
    fontWeight: '500'
  };

  const valueStyle = {
    fontSize: '24px', 
    fontWeight: 'bold', 
    margin: 0
  };

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>📊 Tổng quan hệ thống</h1>
      
      {/* Hàng 1: Tổng quát */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        <div style={cardStyle}>
          <h3 style={titleStyle}>📦 Tổng Sản phẩm</h3>
          <p style={{ ...valueStyle, color: '#3498db' }}>{stats.totalProducts}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>🛒 Tổng Đơn hàng</h3>
          <p style={{ ...valueStyle, color: '#9b59b6' }}>{stats.totalOrders}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>💰 Doanh thu thực tế</h3>
          <p style={{ ...valueStyle, color: '#e67e22' }}>
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND' 
            }).format(stats.totalRevenue || 0)}
          </p>
        </div>
      </div>

      {/* Hàng 2: Trạng thái chi tiết (Mới bổ sung) */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={cardStyle}>
          <h3 style={titleStyle}>⏳ Chờ xử lý</h3>
          <p style={{ ...valueStyle, color: '#f1c40f' }}>{stats.pendingOrders}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>🚚 Đang giao</h3>
          <p style={{ ...valueStyle, color: '#34495e' }}>{stats.shippingOrders}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={titleStyle}>✅ Đã hoàn thành</h3>
          <p style={{ ...valueStyle, color: '#2ecc71' }}>{stats.completedOrders}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#ebf2f2', borderRadius: '10px', color: '#5f8d8d' }}>
        <p>💡 <i>Mẹo: Hãy thường xuyên kiểm tra kho hàng để cập nhật các mẫu giày hot nhất!</i></p>
      </div>
    </div>
  );
};

export default Dashboard;
