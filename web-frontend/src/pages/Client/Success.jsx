import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId; // Lấy ID đơn hàng vừa tạo

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✔</div>
        <h1 style={styles.title}>ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p style={styles.message}>
          Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được hệ thống xử lý.
        </p>
        
        <div style={styles.btnGroup}>
          <button onClick={() => navigate('/my-orders')} style={styles.statusBtn}>
            XEM TIẾN ĐỘ GIAO HÀNG
          </button>
          
          <button onClick={() => navigate('/')} style={styles.homeBtn}>
            TIẾP TỤC MUA SẮM
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', background: '#f8f9fa' },
  card: { textAlign: 'center', background: '#fff', padding: '50px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '500px' },
  icon: { fontSize: '60px', color: '#27ae60', marginBottom: '20px' },
  title: { color: '#2d3436', marginBottom: '15px', fontSize: '24px' },
  message: { color: '#636e72', marginBottom: '30px', lineHeight: '1.6' },
  btnGroup: { display: 'flex', flexDirection: 'column', gap: '15px' },
  statusBtn: { padding: '15px', background: '#0984e3', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  homeBtn: { padding: '15px', background: '#f1f2f6', color: '#2d3436', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Success;