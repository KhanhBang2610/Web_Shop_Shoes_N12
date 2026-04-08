import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DiscountManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        setLoading(false);
      });
  };

  const handleSetDiscount = async (productId) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}/discount`, {
        discount: discountValue
      });
      alert("Cập nhật giảm giá thành công!");
      fetchProducts(); // Refresh danh sách
      setSelectedProduct(null);
      setDiscountValue(0);
    } catch (err) {
      console.error("Lỗi cập nhật giảm giá:", err);
      alert("Lỗi cập nhật giảm giá!");
    }
  };

  const handleRemoveDiscount = async (productId) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}/discount`, {
        discount: 0
      });
      alert("Đã xóa giảm giá!");
      fetchProducts();
    } catch (err) {
      console.error("Lỗi xóa giảm giá:", err);
      alert("Lỗi xóa giảm giá!");
    }
  };

  const openDiscountModal = (product) => {
    setSelectedProduct(product);
    setDiscountValue(product.discount || 0);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>💰 Quản lý giảm giá sản phẩm</h1>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px', color: '#e67e22' }}>Danh sách sản phẩm</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              background: '#fff'
            }}>
              <img
                src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/150'}
                alt={product.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
              />

              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{product.name}</h4>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  Giá gốc: <strong>{Number(product.price).toLocaleString()}đ</strong>
                </p>
                {product.discount > 0 && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#e74c3c' }}>
                    Giảm giá: <strong>{product.discount}%</strong>
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => openDiscountModal(product)}
                  style={{
                    background: product.discount > 0 ? '#f39c12' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {product.discount > 0 ? 'Sửa giảm giá' : 'Thêm giảm giá'}
                </button>

                {product.discount > 0 && (
                  <button
                    onClick={() => handleRemoveDiscount(product.id)}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Xóa giảm giá
                  </button>
                )}
              </div>

              {product.discount > 0 && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#856404'
                }}>
                  📢 Sản phẩm này sẽ xuất hiện trong mục <strong>Khuyến mãi</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal set discount */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Thiết lập giảm giá</h3>
            <p style={{ margin: '10px 0', color: '#666' }}>
              Sản phẩm: <strong>{selectedProduct.name}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Phần trăm giảm giá (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Nhập % giảm giá (0-100)"
              />
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                Giá gốc: <strong>{Number(selectedProduct.price).toLocaleString()}đ</strong>
              </p>
              {discountValue > 0 && (
                <p style={{ margin: '0', fontSize: '14px', color: '#e74c3c' }}>
                  Giá sau giảm: <strong>{(Number(selectedProduct.price) * (1 - discountValue / 100)).toLocaleString()}đ</strong>
                </p>
              )}
            </div>

            {discountValue > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '10px',
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                color: '#155724'
              }}>
                ✅ Sản phẩm sẽ xuất hiện trong mục <strong>Khuyến mãi</strong> của trang user
              </div>
            )}

            {discountValue === 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '10px',
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                color: '#721c24'
              }}>
                ℹ️ Sản phẩm chỉ xuất hiện ở <strong>Trang chủ</strong>, không có trong mục Khuyến mãi
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleSetDiscount(selectedProduct.id)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;