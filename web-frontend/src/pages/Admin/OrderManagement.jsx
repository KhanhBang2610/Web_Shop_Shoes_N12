import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchOrders = () => {
    axios.get('http://localhost:5000/api/orders')
      .then(res => setOrders(res.data.data))
      .catch(error => console.error("Lỗi lấy danh sách đơn hàng:", error));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}/details`);
      setSelectedOrderDetails(res.data.data);
      setShowDetailsModal(true);
    } catch {
      alert("Không thể lấy chi tiết đơn hàng này!");
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>📜 Quản lý đơn hàng</h2>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
              <th style={{ padding: '15px', textAlign: 'center', width: '80px', color: '#7f8c8d' }}>Mã ĐH</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Khách hàng</th>
              <th style={{ padding: '15px', textAlign: 'right', width: '150px', color: '#7f8c8d' }}>Tổng tiền</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Địa chỉ</th>
              <th style={{ padding: '15px', textAlign: 'center', width: '120px', color: '#7f8c8d' }}>Trạng thái</th>
              <th style={{ padding: '15px', textAlign: 'center', width: '120px', color: '#7f8c8d' }}>Ngày đặt</th>
              <th style={{ padding: '15px', textAlign: 'center', width: '180px', color: '#7f8c8d' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s' }}>
                <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>#{order.id}</td>
                <td style={{ padding: '15px', fontWeight: '500' }}>{order.customer_name || `User ID: ${order.user_id}`}</td>
                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#e67e22' }}>
                  {Number(order.total_money).toLocaleString()}đ
                </td>
                <td style={{ padding: '15px', fontSize: '13px', color: '#636e72', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.shipping_address?.replace(/(\d)\s+([A-ZÀ-Ỹ])/u, '$1, $2')}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '6px 12px', borderRadius: '20px', fontSize: '11px', color: 'white', fontWeight: 'bold', display: 'inline-block', minWidth: '90px',
                    background: order.status === 'pending' ? '#f1c40f' : (order.status === 'delivered' ? '#2ecc71' : '#d4335e') 
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d' }}>
                  {new Date(order.order_date).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button 
                    onClick={() => viewOrderDetails(order.id)} 
                    style={{ marginRight: '8px', color: '#3498db', border: '1px solid #3498db', background: 'white', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    Chi tiết
                  </button>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{ padding: '5px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipped">Đang giao</option>
                    <option value="delivered">Hoàn thành</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {showDetailsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '650px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>🛒 Chi tiết các mặt hàng</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#95a5a6' }}>&times;</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f2f6', color: '#7f8c8d', fontSize: '14px' }}>
                  <th style={{ paddingBottom: '10px' }}>Sản phẩm</th>
                  <th style={{ paddingBottom: '10px' }}>Giá mua</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'center' }}>Số lượng</th>
                  <th style={{ paddingBottom: '10px', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderDetails.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f2f6' }}>
                    <td style={{ padding: '15px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={item.image_url ? `http://localhost:5000${item.image_url}` : 'https://via.placeholder.com/45'} 
                        width="45" height="45" style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }} alt="" 
                      />
                      <span style={{ fontWeight: '500', color: '#2d3436' }}>{item.product_name}</span>
                    </td>
                    <td style={{ color: '#2d3436' }}>{Number(item.price).toLocaleString()}đ</td>
                    <td style={{ textAlign: 'center', color: '#636e72' }}>x{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#2ecc71' }}>
                      {(item.price * item.quantity).toLocaleString()}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '25px' }}>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                style={{ padding: '10px 30px', background: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
