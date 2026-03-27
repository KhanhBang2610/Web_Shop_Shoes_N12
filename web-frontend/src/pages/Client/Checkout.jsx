import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [displayItems, setDisplayItems] = useState([]); // Danh sách hàng hiển thị
  const [isBuyNow, setIsBuyNow] = useState(false);
  
  const [formData, setFormData] = useState({ 
    phone: '', 
    address: '',
    note: '' 
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // 1. Kiểm tra xem có dữ liệu "Mua ngay" gửi từ ProductDetail không
    if (location.state && location.state.buyNowItem) {
      setDisplayItems([location.state.buyNowItem]); // Chỉ hiện duy nhất món mua ngay
      setIsBuyNow(true);
    } else {
      // 2. Nếu không có (đi từ giỏ hàng), lấy từ localStorage
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        alert("Không có sản phẩm nào để thanh toán!");
        navigate('/');
        return;
      }
      setDisplayItems(cart);
      setIsBuyNow(false);
    }

    if (!user) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
    }
  }, [location, navigate]);

  const totalPrice = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập!");

    const orderData = {
  user_id: user.id,
  total_money: totalPrice,
  shipping_address: formData.address, 
  phone: String(formData.phone),
  details: displayItems.map(item => ({
    product_id: parseInt(item.id),
    size: String(item.size),
    quantity: parseInt(item.quantity),
    price: parseFloat(item.price)
  }))
};

    try {
    const res = await axios.post('http://localhost:5000/api/orders/checkout', orderData);
    
    if (res.data.success) {
      if (!isBuyNow) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
      }
      alert("Đặt hàng thành công!");
      navigate('/success', { state: { orderId: res.data.orderId } }); 
    }
  } catch (err) {
    console.error("Lỗi chi tiết:", err.response?.data);
    alert(err.response?.data?.message || "Lỗi khi đặt hàng!");
  }
};

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {isBuyNow ? "Thông tin mua ngay" : "Thông tin thanh toán giỏ hàng"}
      </h2>
      
      <div style={styles.flexBox}>
        {/* Form nhập liệu - Giữ nguyên giao diện cũ */}
        <form onSubmit={handleSubmit} style={styles.formSection}>
          <div style={styles.inputGroup}>
            <label>Họ tên khách hàng:</label>
            <input type="text" value={user?.fullname || ''} disabled style={styles.inputDisabled} />
          </div>

          <div style={styles.inputGroup}>
            <label>Số điện thoại:</label>
            <input 
              type="text" 
              required 
              placeholder="Nhập số điện thoại nhận hàng"
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              style={styles.input} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Địa chỉ nhận hàng:</label>
            <textarea 
              required 
              placeholder="Số nhà, tên đường, phường/xã..."
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
              style={styles.textarea} 
            />
          </div>

          <button type="submit" style={styles.confirmBtn}>
            XÁC NHẬN ĐẶT HÀNG
          </button>
        </form>

        {/* Tóm tắt đơn hàng */}
        <div style={styles.summarySection}>
          <h3>Sản phẩm thanh toán</h3>
          <div style={styles.divider}></div>
          
          {displayItems.map((item, idx) => (
            <div key={idx} style={styles.itemSummary}>
              <span>{item.name} <strong>(Size: {item.size})</strong> x {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
          ))}

          <div style={styles.divider}></div>
          
          <div style={styles.totalRow}>
            <strong>Tổng cộng:</strong>
            <strong style={{ color: '#e67e22', fontSize: '20px' }}>
              {totalPrice.toLocaleString()}đ
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', minHeight: '80vh' },
  title: { textAlign: 'center', marginBottom: '30px', color: '#2d3436' },
  flexBox: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  formSection: { flex: 1.5, minWidth: '300px', background: '#f9f9f9', padding: '25px', borderRadius: '15px' },
  summarySection: { flex: 1, minWidth: '300px', border: '1px solid #eee', padding: '25px', borderRadius: '15px', alignSelf: 'flex-start' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' },
  inputDisabled: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', background: '#eee', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '100px', boxSizing: 'border-box' },
  confirmBtn: { width: '100%', padding: '15px', background: '#2d3436', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', fontSize: '16px' },
  itemSummary: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#2d3436' },
  divider: { height: '1px', background: '#eee', margin: '15px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default Checkout;

