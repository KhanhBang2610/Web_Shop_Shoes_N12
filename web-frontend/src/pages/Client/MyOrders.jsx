import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthConfig } from '../../api/authApi';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/orders/user/${user.id}`, getAuthConfig())
        .then(res => {
          setOrders(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi lấy danh sách đơn hàng:", err);
          setLoading(false);
        });
    }
  }, [user?.id]);

  const renderStatus = (status) => {
    const statusMap = {
      'pending': { text: '🕒 Chờ xử lý', color: '#f39c12', bg: '#fef5e7' },
      'shipped': { text: '🚚 Đang giao hàng', color: '#3498db', bg: '#ebf5fb' },
      'delivered': { text: '✅ Hoàn thành', color: '#27ae60', bg: '#eafaf1' },
      'canceled': { text: '❌ Đã hủy', color: '#e74c3c', bg: '#fdedec' }
    };

    const current = statusMap[status] || { text: status, color: '#7f8c8d', bg: '#f4f6f7' };

    return (
      <span style={{ 
        padding: '6px 15px', 
        borderRadius: '20px', 
        fontSize: '13px', 
        fontWeight: 'bold',
        color: current.color,
        backgroundColor: current.bg
      }}>
        {current.text}
      </span>
    );
  };

  if (loading) return <div style={styles.container}><p style={{textAlign: 'center'}}>Đang tải dữ liệu...</p></div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📦 TIẾN ĐỘ ĐƠN HÀNG</h2>
      
      <div style={styles.flexLayout}>
        <div style={styles.listSection}>
          {orders.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.orderIdText}>Mã đơn: #{order.id}</span>
                  {renderStatus(order.status)}
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📅 Ngày đặt:</span>
                    <span style={styles.value}>{new Date(order.order_date).toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>💰 Tổng tiền:</span>
                    <span style={styles.totalValue}>
                      {Number(order.total_money).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📍 Địa chỉ:</span>
                    <span style={styles.value}>
                      {order.shipping_address?.replace(/(\d)\s+([A-ZÀ-Ỹ])/u, '$1, $2')}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📞 Số điện thoại:</span>
                    <span style={styles.value}>{order.phone}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    padding: '40px 20px', 
    backgroundColor: '#f4f7f6', 
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif'
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '40px', 
    color: '#1a202c',
    fontSize: '32px',
    fontWeight: '700'
  },
  flexLayout: { display: 'flex', justifyContent: 'center', width: '100%' },
  listSection: { 
    width: '100%', 
    maxWidth: '850px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '25px' 
  },
  orderCard: { 
    backgroundColor: '#fff', 
    borderRadius: '15px', 
    padding: '25px', 
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f7fafc'
  },
  orderIdText: { fontSize: '18px', fontWeight: 'bold', color: '#2d3748' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px' },
  label: { color: '#718096' },
  value: { color: '#2d3748', fontWeight: '500' },
  totalValue: { color: '#dd6b20', fontWeight: 'bold', fontSize: '18px' },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    color: '#a0aec0'
  }
};

export default MyOrders;