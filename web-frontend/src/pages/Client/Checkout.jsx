import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCart, clearCart } from '../../utils/cartUtils';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isBuyNow] = useState(() => !!location.state?.buyNowItem);

  const [displayItems] = useState(() => {
    if (location.state?.buyNowItem) {
      return [location.state.buyNowItem];
    }
    return getCart();
  });

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (error) {
      console.error("Lỗi khi parse thông tin user:", error);
      return null;
    }
  });
  
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '' // Vẫn giữ city ở state để User nhập liệu dễ dàng
  });

  useEffect(() => {
    if (!user) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
      return;
    }

    if (displayItems.length === 0) {
      alert("Không có sản phẩm nào để thanh toán!");
      navigate('/');
    }
  }, [user, navigate, displayItems.length]);

  const totalPrice = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập!");

    // --- LOGIC GOM ĐỊA CHỈ: Kết hợp Address và City ---
    const combinedAddress = `${formData.address}, ${formData.city}`;

    const orderData = {
      user_id: user.id,
      total_money: totalPrice,
      shipping_address: combinedAddress, // Gửi chuỗi đã gom cho Admin
      phone: String(formData.phone),
      // Chúng ta không cần gửi trường city riêng biệt nữa nếu Admin đã xem trong shipping_address
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
          clearCart();
        }
        alert("Đặt hàng thành công!");
        navigate('/success', { state: { orderId: res.data.data.orderId } });
      } else {
        alert(res.data.message || "Đặt hàng không thành công!");
      }
    } catch (err) {
      console.error("Lỗi chi tiết từ Server:", err.response?.data);
      alert(err.response?.data?.message || "Lỗi khi đặt hàng!");
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {isBuyNow ? "🛍️ THÔNG TIN MUA NGAY" : "🛒 THANH TOÁN GIỎ HÀNG"}
      </h2>

      <div style={styles.flexBox}>
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
              value={formData.phone}
              placeholder="Nhập số điện thoại nhận hàng"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={styles.input}
            />
          </div>

          {/* Trường Thành phố tách riêng để User dễ nhập */}
          <div style={styles.inputGroup}>
            <label>Tỉnh / Thành phố:</label>
            <input
              type="text"
              required
              value={formData.city}
              placeholder="Ví dụ: Tp.HCM, Hà Nội..."
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Địa chỉ cụ thể:</label>
            <textarea
              required
              value={formData.address}
              placeholder="Số nhà, tên đường, phường/xã..."
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={styles.textarea}
            />
          </div>

          <button type="submit" style={styles.confirmBtn}>
            XÁC NHẬN ĐẶT HÀNG
          </button>
        </form>

        <div style={styles.summarySection}>
          <h3>Sản phẩm thanh toán</h3>
          <div style={styles.divider}></div>

          {displayItems.map((item, idx) => (
            <div key={idx} style={styles.itemSummary}>
              <span>{item.name} <strong>(Size: {item.size})</strong> x {item.quantity}</span>
              {/* FIX TIỀN TỆ: toLocaleString('vi-VN') */}
              <span>{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
            </div>
          ))}

          <div style={styles.divider}></div>

          <div style={styles.totalRow}>
            <strong>Tổng cộng:</strong>
            <strong style={{ color: '#e67e22', fontSize: '20px' }}>
              {/* FIX TIỀN TỆ: toLocaleString('vi-VN') */}
              {Number(totalPrice).toLocaleString('vi-VN')}đ
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', minHeight: '80vh', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', marginBottom: '30px', color: '#2d3436', fontWeight: 'bold' },
  flexBox: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  formSection: { flex: 1.5, minWidth: '300px', background: '#f9f9f9', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  summarySection: { flex: 1, minWidth: '300px', border: '1px solid #eee', padding: '25px', borderRadius: '15px', alignSelf: 'flex-start', background: '#fff' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' },
  inputDisabled: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', background: '#e9ecef', boxSizing: 'border-box', color: '#6c757d' },
  textarea: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  confirmBtn: { width: '100%', padding: '15px', background: '#2d3436', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', fontSize: '16px', transition: '0.3s' },
  itemSummary: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#2d3436' },
  divider: { height: '1px', background: '#eee', margin: '15px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default Checkout;