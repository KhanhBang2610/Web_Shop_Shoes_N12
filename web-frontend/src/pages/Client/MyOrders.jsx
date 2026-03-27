import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null); // Lưu chi tiết SP của đơn đang chọn
  const [activeOrderId, setActiveOrderId] = useState(null); // Lưu ID đơn đang được xem
  
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Lấy danh sách đơn hàng của User
  useEffect(() => {
    if (user && user.id) {
      axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
        .then(res => setOrders(res.data))
        .catch(err => console.error("Lỗi lấy danh sách đơn hàng:", err));
    }
  }, [user?.id]);

  // 2. Hàm lấy chi tiết sản phẩm khi click vào một đơn hàng
  const handleViewDetails = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}/details`);
      setSelectedOrderDetails(res.data);
      setActiveOrderId(orderId);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng:", err);
      alert("Không thể tải chi tiết đơn hàng này.");
    }
  };

  // 3. Hàm hiển thị trạng thái tiếng Việt
  const renderStatus = (status) => {
    switch (status) {
      case 'pending': return <span style={{color: '#f39c12'}}>🕒 Chờ xử lý</span>;
      case 'shipped': return <span style={{color: '#3498db'}}>🚚 Đang giao hàng</span>;
      case 'delivered': return <span style={{color: '#27ae60'}}>✅ Hoàn thành</span>;
      case 'canceled': return <span style={{color: '#e74c3c'}}>❌ Đã hủy</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📦 TIẾN ĐỘ ĐƠN HÀNG CỦA BẠN</h2>
      
      <div style={styles.flexLayout}>
        {/* CỘT TRÁI: DANH SÁCH ĐƠN HÀNG */}
        <div style={styles.listSection}>
          {orders.length === 0 ? (
            <p>Bạn chưa có đơn hàng nào.</p>
          ) : (
            orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => handleViewDetails(order.id)}
                style={{
                  ...styles.orderCard,
                  borderLeft: activeOrderId === order.id ? '6px solid #2d3436' : '6px solid #ddd',
                  backgroundColor: activeOrderId === order.id ? '#f1f2f6' : '#fff'
                }}
              >
                <div style={styles.cardHeader}>
                  <strong>Mã đơn: #{order.id}</strong>
                  {renderStatus(order.status)}
                </div>
                <div style={styles.cardBody}>
                  <p>📅 Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}</p>
                  <p>💰 Tổng tiền: <b style={{color: '#e67e22'}}>{order.total_money?.toLocaleString()}đ</b></p>
                  <p>📍 Địa chỉ: {order.shipping_address}</p>
                </div>
                <div style={styles.cardFooter}>Bấm để xem chi tiết sản phẩm ↓</div>
              </div>
            ))
          )}
        </div>

        {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM TRONG ĐƠN */}
        <div style={styles.detailSection}>
          <h3 style={{marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
            Chi tiết mặt hàng
          </h3>
          {!selectedOrderDetails ? (
            <p style={{color: '#999', fontStyle: 'italic'}}>Chọn một đơn hàng bên trái để xem tiến độ chi tiết...</p>
          ) : (
            <div>
              {selectedOrderDetails.map((item, index) => (
                <div key={index} style={styles.productItem}>
                  <img 
                    src={`http://localhost:5000${item.image_url}`} 
                    alt={item.product_name} 
                    style={styles.productImg} 
                  />
                  <div style={styles.productInfo}>
                    <div style={{fontWeight: 'bold'}}>{item.product_name}</div>
                    <div style={{fontSize: '14px', color: '#666'}}>
                      Số lượng: {item.quantity} | Giá: {item.price?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))}
              <div style={styles.supportNote}>
                <p>Nếu đơn hàng có vấn đề, vui lòng liên hệ CSKH: <b>1900xxxx</b></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const styles = {
  container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px', color: '#2d3436' },
  flexLayout: { display: 'flex', gap: '30px', flexWrap: 'wrap' },
  listSection: { flex: 1.5, minWidth: '350px' },
  detailSection: { flex: 1, minWidth: '300px', background: '#f9f9f9', padding: '25px', borderRadius: '15px', border: '1px solid #eee', height: 'fit-content', position: 'sticky', top: '20px' },
  orderCard: { padding: '20px', borderRadius: '10px', marginBottom: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: '0.3s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  cardBody: { fontSize: '14px', color: '#444', lineHeight: '1.6' },
  cardFooter: { marginTop: '10px', fontSize: '12px', color: '#999', textAlign: 'right' },
  productItem: { display: 'flex', gap: '15px', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' },
  productImg: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' },
  productInfo: { flex: 1 },
  supportNote: { marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#888' }
};

export default MyOrders;