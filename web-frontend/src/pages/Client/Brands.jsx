import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Brands = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    fetchProductsByCategory(category.id);
  };

  const fetchProductsByCategory = (categoryId) => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/products?category_id=${categoryId}`)
      .then(res => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy sản phẩm:", err);
        setProducts([]);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        setCategories(res.data.data);
        // Chọn danh mục đầu tiên mặc định
        if (res.data.data.length > 0) {
          handleSelectCategory(res.data.data[0]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  };

  // Lấy danh sách danh mục khi component mount
  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToCart = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>
      {/* Banner */}
      <div style={styles.banner}>
        <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: '800', letterSpacing: '-2px' }}>THƯƠNG HIỆU GIÀY</h1>
        <p style={{ fontSize: '1.5rem', color: '#555555' }}>Khám phá các bộ sưu tập từ những thương hiệu hàng đầu</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', minHeight: '60vh' }}>
        {/* Sidebar - Danh sách danh mục */}
        <div style={styles.sidebar}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Danh mục</h3>
          <div style={styles.categoryList}>
            {categories.length > 0 ? (
              categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  style={{
                    ...styles.categoryItem,
                    ...(selectedCategory?.id === category.id ? styles.categoryItemActive : styles.categoryItemInactive)
                  }}
                >
                  {category.name}
                  <span style={styles.categoryCount}>
                    ({products.length > 0 && selectedCategory?.id === category.id ? products.length : '...'})
                  </span>
                </button>
              ))
            ) : (
              <p style={{ color: '#999' }}>Chưa có danh mục nào</p>
            )}
          </div>
        </div>

        {/* Main Content - Danh sách sản phẩm */}
        <div style={{ flex: 1 }}>
          {selectedCategory && (
            <>
              <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>
                {selectedCategory.name}
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải sản phẩm...</div>
              ) : products.length > 0 ? (
                <div style={styles.productGrid}>
                  {products.map(product => (
                    <div key={product.id} style={styles.card}>
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
                          {product.discount > 0 ? (
                            <>
                              <p style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through', margin: '0' }}>
                                {Number(product.price).toLocaleString()}đ
                              </p>
                              <p style={styles.price}>
                                {Number(product.discounted_price).toLocaleString()}đ
                                <span style={{ marginLeft: '10px', fontSize: '14px', color: '#e74c3c', fontWeight: 'bold' }}>
                                  -{product.discount}%
                                </span>
                              </p>
                            </>
                          ) : (
                            <p style={styles.price}>{Number(product.price).toLocaleString()}đ</p>
                          )}
                        </div>
                      </Link>

                      <div style={{ padding: '0 15px 15px 15px' }}>
                        <div style={styles.buttonGroup}>
                          <button
                            style={styles.cartBtn}
                            onClick={() => handleAddToCart(product)}
                          >
                            Thêm vào giỏ
                          </button>

                          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                            <button style={styles.buyBtn}>
                              Mua ngay
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9f9f9', borderRadius: '10px' }}>
                  <h3 style={{ fontSize: '24px', color: '#333', margin: '0 0 10px 0' }}>❌ Không có sản phẩm phù hợp</h3>
                  <p style={{ color: '#999', margin: '0 0 20px 0' }}>Không có sản phẩm nào trong danh mục "{selectedCategory.name}"</p>
                  <Link to="/" style={{ color: '#e67e22', fontWeight: 'bold', textDecoration: 'none' }}>← Quay lại trang chính</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: '#f3f3f3', padding: '80px 20px', textAlign: 'center', borderRadius: '20px',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #16c9d9 100%)', marginBottom: '40px',
    color: '#fff'
  },
  sidebar: {
    width: '220px', background: '#fff', padding: '20px', borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '20px'
  },
  categoryList: {
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  categoryItem: {
    border: 'none', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer',
    textAlign: 'left', transition: '0.3s', fontSize: '14px', fontWeight: '500',
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  categoryItemActive: {
    background: '#e67e22', color: '#fff'
  },
  categoryItemInactive: {
    background: '#f9f9f9', color: '#333', border: '1px solid #eee'
  },
  categoryCount: {
    fontSize: '12px', opacity: '0.7'
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

export default Brands;
