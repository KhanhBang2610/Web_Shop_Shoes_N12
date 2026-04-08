import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PurchaseHistory = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Lấy danh sách đơn hàng đã hoàn thành
  useEffect(() => {
    if (user && user.id) {
      axios.get(`http://localhost:5000/api/orders/user/${user.id}`)
        .then(res => {
          // Lọc chỉ các đơn hàng có status là 'delivered'
          const completed = res.data.filter(order => order.status === 'delivered');
          setCompletedOrders(completed);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi lấy danh sách đơn hàng:", err);
          setLoading(false);
        });
    }
  }, [user]);

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

  // 3. Hàm mua lại sản phẩm
  const handleRepurchase = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = cart.find(
        cartItem => cartItem.id === item.product_id && cartItem.size === item.size
      );

      if (existingItem) {
        // Nếu đã có, tăng số lượng
        existingItem.quantity += item.quantity;
      } else {
        // Nếu chưa có, thêm vào giỏ
        cart.push({
          id: item.product_id,
          name: item.product_name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          image_url: item.image_url
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      
      // Hiển thị thông báo thành công
      setSuccessMessage(`Đã thêm "${item.product_name}" vào giỏ hàng!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Lỗi khi mua lại sản phẩm:", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  // 4. Hàm điều hướng đến checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📜 LỊCH SỬ MUA HÀNG</h2>
      
      {/* Thông báo thành công */}
      {successMessage && (
        <div style={styles.successAlert}>
          ✅ {successMessage}
        </div>
      )}

      {completedOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Bạn chưa có đơn hàng hoàn thành nào.
          </p>
          <button 
            onClick={() => navigate('/')} 
            style={styles.shopBtn}
          >
            🛍️ Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div style={styles.flexLayout}>
          {/* CỘT TRÁI: DANH SÁCH ĐƠN HÀNG */}
          <div style={styles.listSection}>
            {completedOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => handleViewDetails(order.id)}
                style={{
                  ...styles.orderCard,
                  borderLeft: activeOrderId === order.id ? '6px solid #27ae60' : '6px solid #ddd',
                  backgroundColor: activeOrderId === order.id ? '#f1f6f4' : '#fff'
                }}
              >
                <div style={styles.cardHeader}>
                  <strong>Mã đơn: #{order.id}</strong>
                  <span style={{color: '#27ae60', fontWeight: 'bold'}}>✅ Hoàn thành</span>
                </div>
                <div style={styles.cardBody}>
                  <p>📅 Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}</p>
                  <p>💰 Tổng tiền: <b style={{color: '#e67e22'}}>{order.total_money?.toLocaleString()}đ</b></p>
                  <p>📍 Địa chỉ: {order.shipping_address?.replace(/(\d)\s+([A-ZÀ-Ỹ])/u, '$1, $2')}</p>
                </div>
                <div style={styles.cardFooter}>Bấm để xem sản phẩm và mua lại ↓</div>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM TRONG ĐƠN */}
          {/* <div style={styles.detailSection}>
            <h3 style={{marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
              Chi tiết sản phẩm
            </h3>
            {!selectedOrderDetails ? (
              <p style={{color: '#999', fontStyle: 'italic'}}>Chọn một đơn hàng bên trái để xem chi tiết sản phẩm...</p>
            ) : (
              <div>
                {selectedOrderDetails.map((item, index) => (
                  <div key={index} style={styles.productItem}>
                    <img 
                      src={`http://localhost:5000${item.image_url}`} 
                      alt={item.product_name} 
                      style={styles.productImg} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/70'; }}
                    />
                    <div style={styles.productInfo}>
                      <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{item.product_name}</div>
                      <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>
                        Size: <strong>{item.size || 'N/A'}</strong> | Số lượng: <strong>{item.quantity}</strong>
                      </div>
                      <div style={{fontSize: '14px', color: '#e67e22', fontWeight: 'bold', marginBottom: '8px'}}>
                        Giá: {item.price?.toLocaleString()}đ
                      </div>
                      <button 
                        onClick={() => handleRepurchase(item)}
                        style={styles.repurchaseBtn}
                      >
                        🛒 Mua lại
                      </button>
                    </div>
                  </div>
                ))}
                <div style={styles.actionFooter}>
                  <button 
                    onClick={handleCheckout}
                    style={styles.checkoutBtn}
                  >
                    Thanh toán giỏ hàng
                  </button>
                </div>
              </div>
            )}
          </div> */}
        </div>
      )}
    </div>
  );
};

// CSS Styles
const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '40px auto', 
    padding: '0 20px', 
    fontFamily: 'Arial, sans-serif',
    minHeight: '70vh'
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '30px', 
    color: '#2d3436',
    fontSize: '28px'
  },
  successAlert: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    padding: '12px 20px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    border: '1px solid #eee'
  },
  shopBtn: {
    marginTop: '20px',
    padding: '12px 30px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  flexLayout: { 
    display: 'flex', 
    gap: '30px', 
    flexWrap: 'wrap' 
  },
  listSection: { 
    flex: 1.5, 
    minWidth: '350px' 
  },
  detailSection: { 
    flex: 1, 
    minWidth: '300px', 
    background: '#f9f9f9', 
    padding: '25px', 
    borderRadius: '15px', 
    border: '1px solid #eee', 
    height: 'fit-content', 
    position: 'sticky', 
    top: '100px' 
  },
  orderCard: { 
    padding: '20px', 
    borderRadius: '10px', 
    marginBottom: '15px', 
    cursor: 'pointer', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
    transition: '0.3s' 
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '10px',
    alignItems: 'center'
  },
  cardBody: { 
    fontSize: '14px', 
    color: '#444', 
    lineHeight: '1.6' 
  },
  cardFooter: { 
    marginTop: '10px', 
    fontSize: '12px', 
    color: '#999', 
    textAlign: 'right' 
  },
  productItem: { 
    display: 'flex', 
    gap: '15px', 
    alignItems: 'flex-start', 
    padding: '15px 0', 
    borderBottom: '1px solid #eee' 
  },
  productImg: { 
    width: '70px', 
    height: '70px', 
    objectFit: 'cover', 
    borderRadius: '8px' 
  },
  productInfo: { 
    flex: 1 
  },
  repurchaseBtn: {
    padding: '8px 12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  actionFooter: {
    marginTop: '20px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '2px solid #eee'
  },
  checkoutBtn: {
    padding: '12px 30px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  }
};

export default PurchaseHistory;
