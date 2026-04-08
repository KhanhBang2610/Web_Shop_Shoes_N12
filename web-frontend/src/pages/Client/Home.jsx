import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Lỗi lấy sản phẩm:", err));
  }, []);

  // 1. Logic lọc tìm kiếm từ URL (ví dụ: ?search=nike)
  const queryParams = new URLSearchParams(location.search);
  const searchKeyword = queryParams.get('search')?.toLowerCase() || "";

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchKeyword) || 
    (product.category_name && product.category_name.toLowerCase().includes(searchKeyword))
  );

  // 2. Hàm thêm vào giỏ hàng (Chỉ dành cho nút "Thêm vào giỏ")
  const addToCart = (product) => {
    navigate(`/product/${product.id}`); 
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
      {/* Banner */}
      <div style={styles.banner}>
        <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: '800', letterSpacing: '-2px' }}>THỜI TRANG PHONG CÁCH</h1>
        <p style={{ fontSize: '1.5rem', color: '#555' }}>Khám phá bộ sưu tập giày Hot nhất 2026</p>
      </div>

      <h2 style={{ margin: '40px 0 20px', borderLeft: '6px solid #333', paddingLeft: '15px', fontSize: '24px' }}>
        {searchKeyword ? `Kết quả tìm kiếm cho: "${searchKeyword}"` : "Sản phẩm mới nhất"}
      </h2>

      {/* Grid sản phẩm */}
      <div style={styles.productGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} style={styles.card}>
              {/* Click vào vùng thông tin để xem chi tiết */}
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={styles.imageBox}>
                  <img 
                    src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/250'} 
                    alt={product.name} 
                    style={styles.image}
                  />
                </div>
                
                <div style={styles.info}>
                  <p style={styles.category}>{product.category_name || 'Sneakers'}</p>
                  <h3 style={styles.name}>{product.name}</h3>
                  <p style={styles.price}>{Number(product.price).toLocaleString()}đ</p>
                </div>
              </Link>

              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={styles.buttonGroup}>
                  {/* Nút Thêm vào giỏ: Ở lại trang và hiện thông báo */}
                  <button 
                    style={styles.cartBtn} 
                    onClick={() => addToCart(product)}
                  >
                    Thêm vào giỏ
                  </button>

                  {/* Nút Mua ngay: Chuyển hướng sang trang chi tiết để chọn Size */}
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                    <button style={styles.buyBtn}>
                      Mua ngay
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
            <h3>Không tìm thấy sản phẩm nào khớp với từ khóa của bạn.</h3>
            <Link to="/" style={{ color: '#e67e22', fontWeight: 'bold' }}>Quay lại trang chính</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: '#f3f3f3', padding: '80px 20px', textAlign: 'center', borderRadius: '20px',
    backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', marginBottom: '20px'
  },
  productGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px'
  },
  card: {
    background: '#fff', borderRadius: '15px', overflow: 'hidden', 
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0',
    display: 'flex', flexDirection: 'column', transition: '0.3s'
  },
  imageBox: { width: '100%', height: '240px', overflow: 'hidden', background: '#f9f9f9' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: '0.3s' },
  info: { padding: '15px' },
  category: { fontSize: '11px', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', margin: '0 0 5px' },
  name: { fontSize: '17px', fontWeight: '600', margin: '0 0 10px', height: '42px', overflow: 'hidden', color: '#2d3436' },
  price: { fontSize: '20px', color: '#e67e22', fontWeight: '800', marginBottom: '5px' },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  cartBtn: { background: '#fff', color: '#2d3436', border: '1px solid #2d3436', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', width: '100%' },
  buyBtn: { background: '#2d3436', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', width: '100%' }
};

export default Home;