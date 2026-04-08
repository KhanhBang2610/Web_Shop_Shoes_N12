import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Thêm useNavigate
import { getCart, saveCart } from '../../utils/cartUtils';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  // Load giỏ hàng từ localStorage
  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Hàm thay đổi số lượng
  const updateQuantity = (id, size, delta) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id && item.size === size) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    saveCart(updatedCart);
    setCartItems(updatedCart);
  };

  // Hàm xóa sản phẩm
  const removeItem = (id, size) => {
    const updatedCart = cartItems.filter(item => !(item.id === id && item.size === size));
    saveCart(updatedCart);
    setCartItems(updatedCart);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Giỏ hàng của bạn</h1>

      <div style={styles.cartBox}>
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} style={styles.itemRow}>
                <img 
                  src={item.image_url ? `http://localhost:5000${item.image_url}` : 'https://via.placeholder.com/80'} 
                  style={styles.itemImg} 
                  alt={item.name} 
                />
                
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemSize}>Size: <strong>{item.size || 'N/A'}</strong></p>
                  <p style={styles.itemPrice}>{Number(item.price).toLocaleString()}đ</p>
                </div>

                <div style={styles.quantityBox}>
                  <button onClick={() => updateQuantity(item.id, item.size, -1)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.size, 1)} style={styles.qtyBtn}>+</button>
                </div>

                <button onClick={() => removeItem(item.id, item.size)} style={styles.removeBtn}>Xóa</button>
              </div>
            ))}

            <div style={styles.footer}>
              <h2 style={styles.totalText}>Tổng cộng: {totalPrice.toLocaleString()}đ</h2>
              
              {/* 3. Thêm sự kiện onClick để chuyển hướng sang Checkout */}
              <button 
                onClick={() => navigate('/checkout')} 
                style={styles.checkoutBtn}
              >
                TIẾN HÀNH THANH TOÁN
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Giỏ hàng trống</p>
            <Link to="/" style={{ color: '#e67e22', fontWeight: 'bold' }}>Tiếp tục mua sắm</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '50px auto', padding: '0 20px', minHeight: '70vh' },
  title: { textAlign: 'center', marginBottom: '30px', fontSize: '28px' },
  cartBox: { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
  itemRow: { display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #eee', gap: '20px' },
  itemImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' },
  itemInfo: { flex: 2 },
  itemName: { fontSize: '18px', margin: '0 0 5px' },
  itemSize: { color: '#e67e22', fontSize: '14px', margin: '0 0 5px' },
  itemPrice: { fontWeight: 'bold', color: '#333' },
  quantityBox: { display: 'flex', alignItems: 'center', gap: '15px', flex: 1, justifyContent: 'center' },
  qtyBtn: { width: '30px', height: '30px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', borderRadius: '5px' },
  qtyNum: { fontWeight: 'bold', fontSize: '16px' },
  removeBtn: { color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' },
  footer: { marginTop: '30px', textAlign: 'right' },
  totalText: { fontSize: '24px', marginBottom: '20px' },
  checkoutBtn: { padding: '15px 40px', background: '#2d3436', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }
};

export default Cart;