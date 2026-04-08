import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PurchaseHistory = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Lấy danh sách đơn hàng đã hoàn thành (delivered)
  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
        .then(res => {
          // Lọc chỉ lấy những đơn đã giao thành công
          const completed = res.data.data.filter(order => order.status === 'delivered');
          setCompletedOrders(completed);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi lấy danh sách đơn hàng:", err);
          setLoading(false);
        });
    }
  }, [user?.id]);

  if (loading) {
    return <div style={styles.container}><p style={{ textAlign: 'center' }}>Đang tải lịch sử...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📜 LỊCH SỬ MUA HÀNG</h2>
      
      <div style={styles.flexLayout}>
        <div style={styles.listSection}>
          {completedOrders.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                Bạn chưa có đơn hàng hoàn thành nào.
              </p>
              <button onClick={() => navigate('/')} style={styles.shopBtn}>
                🛍️ Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            completedOrders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                {/* Header đơn hàng */}
                <div style={styles.cardHeader}>
                  <span style={styles.orderIdText}>Mã đơn: #{order.id}</span>
                  <span style={styles.statusBadge}>✅ Hoàn thành</span>
                </div>

                {/* Nội dung đơn hàng */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📅 Ngày đặt:</span>
                    <span style={styles.value}>
                      {new Date(order.order_date).toLocaleString('vi-VN')}
                    </span>
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
                    <span style={styles.label}>📞 Liên hệ:</span>
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
    maxWidth: '850px', // Khớp kích thước với trang Tiến độ
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  orderCard: { 
    backgroundColor: '#fff', 
    borderRadius: '15px', 
    padding: '25px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    borderLeft: '6px solid #27ae60' // Màu xanh đặc trưng của Hoàn thành
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
  },
  orderIdText: { fontSize: '18px', fontWeight: 'bold', color: '#2d3748' },
  statusBadge: {
    padding: '5px 12px',
    backgroundColor: '#eafaf1',
    color: '#27ae60',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px' },
  label: { color: '#718096' },
  value: { color: '#2d3748', fontWeight: '500', textAlign: 'right' },
  totalValue: { color: '#e67e22', fontWeight: 'bold', fontSize: '17px' },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  shopBtn: {
    padding: '12px 25px',
    backgroundColor: '#2d3748',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default PurchaseHistory;