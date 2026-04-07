import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';

const Promotions = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/promotions')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Lỗi lấy sản phẩm khuyến mãi:", err));
  }, []);

  // Hàm thêm vào giỏ hàng (Chuyển đến trang chi tiết sản phẩm)
  const addToCart = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Banner */}
      <div style={styles.banner}>
        <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: '900', letterSpacing: '-2px' }}>KHUYẾN MÃI HOT</h1>
        <p style={{ fontSize: '1.2rem', color: '#555' }}>Giảm giá lên đến 50% cho các sản phẩm giày dép yêu thích</p>
      </div>

      <h2 style={{ margin: '40px 0 20px', borderLeft: '6px solid #333', paddingLeft: '15px', fontSize: '24px' }}>
        Sản phẩm khuyến mãi
      </h2>

      {/* Grid sản phẩm */}
      <div style={styles.productGrid}>
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} style={styles.card}>
              {/* Click vào vùng thông tin để xem chi tiết */}
              <Link to={`/product/${product.id}?from=promotions`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={styles.imageBox}>
                  <img
                    src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/250'}
                    alt={product.name}
                    style={styles.image}
                  />
                  {/* Badge khuyến mãi */}
                  {product.discount > 0 && (
                    <span style={styles.discountBadge}>-{product.discount}%</span>
                  )}
                </div>
                <div style={styles.info}>
                  <p style={styles.category}>{product.category_name || "Sneaker"}</p>
                  <h3 style={styles.name}>{product.name}</h3>
                  <div style={styles.priceRow}>
                    <span style={styles.discountedPrice}>{Number(product.discounted_price ?? product.price ?? 0).toLocaleString()}đ</span>
                    {product.discount > 0 && (
                      <span style={styles.originalPrice}>{Number(product.original_price ?? product.oldPrice ?? 0).toLocaleString()}đ</span>
                    )}
                  </div>
                </div>
              </Link>
              {/* Nút thêm vào giỏ hàng */}
              <button
                style={styles.addToCartBtn}
                onClick={() => addToCart(product)}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm khuyến mãi nào.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  banner: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    color: 'white',
    borderRadius: '10px',
    marginBottom: '40px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    background: 'white',
  },
  imageBox: {
    position: 'relative',
    height: '250px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'red',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  info: {
    padding: '15px',
  },
  category: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 5px',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px',
    color: '#333',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  discountedPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: '14px',
    color: '#888',
    textDecoration: 'line-through',
  },
  addToCartBtn: {
    width: '100%',
    padding: '10px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '0 0 10px 10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
};

export default Promotions;