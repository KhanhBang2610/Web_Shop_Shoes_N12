import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getCart, saveCart } from '../../utils/cartUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const sizes = [38, 39, 40, 41, 42, 43]; 

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(err => console.error("Lỗi lấy chi tiết sản phẩm:", err));
  }, [id]);

  // Kiểm tra nếu truy cập từ trang khuyến mãi
  const isFromPromotions = location.search.includes('from=promotions');

  const displayPrice = isFromPromotions && product?.discount > 0 
    ? Number(product.discounted_price ?? product.price) 
    : Number(product?.price ?? 0);
  const originalPrice = Number(product?.original_price ?? product?.price ?? 0);

  const handleAddToCart = (isBuyNow = false) => {
    if (!selectedSize) {
      alert("Vui lòng chọn Size giày trước khi tiếp tục!");
      return;
    }

    const currentItem = {
      id: product.id,
      name: product.name,
      price: displayPrice,
      image_url: product.image_url,
      size: selectedSize,
      quantity: 1,
      discount: isFromPromotions ? Number(product.discount) || 0 : 0,
      original_price: isFromPromotions ? originalPrice : displayPrice
    };

    if (isBuyNow) {
      navigate('/checkout', { state: { buyNowItem: currentItem } });
    } else {
      const cart = getCart();
      const existingIndex = cart.findIndex(item => 
        item.id === product.id && String(item.size) === String(selectedSize)
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(currentItem);
      }

      saveCart(cart);
      alert(`Đã thêm ${product.name} (Size: ${selectedSize}) vào giỏ hàng!`);
    }
  };

  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải sản phẩm...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.flexBox}>
        <div style={styles.imageSection}>
          <img 
            src={product.image_url ? `http://localhost:5000${product.image_url}` : 'https://via.placeholder.com/500'} 
            style={styles.mainImage} 
            alt={product.name} 
          />
        </div>

        <div style={styles.infoSection}>
          <p style={styles.category}>{product.category_name || 'SNEAKERS'}</p>
          <h1 style={styles.title}>{product.name}</h1>
          <div style={styles.priceRow}>
            <p style={styles.price}>{displayPrice.toLocaleString()}đ</p>
            {isFromPromotions && product.discount > 0 && (
              <p style={styles.oldPrice}>{originalPrice.toLocaleString()}đ</p>
            )}
          </div>
          
          <div style={styles.divider}></div>

          <p style={styles.description}>{product.description || "Sản phẩm chất lượng cao, thiết kế thời trang phù hợp mọi hoạt động."}</p>

          <div style={{ marginTop: '30px' }}>
            <h4 style={{ marginBottom: '15px' }}>Chọn Size (EU):</h4>
            <div style={styles.sizeGrid}>
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    ...styles.sizeBtn,
                    background: selectedSize === size ? '#2d3436' : '#fff',
                    color: selectedSize === size ? '#fff' : '#2d3436',
                    borderColor: selectedSize === size ? '#2d3436' : '#dfe6e9'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.actionBox}>
            <button 
              style={styles.addCartBtn} 
              onClick={() => handleAddToCart(false)}
            >
              THÊM VÀO GIỎ
            </button>
            <button 
              style={styles.buyNowBtn} 
              onClick={() => handleAddToCart(true)}
            >
              MUA NGAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '50px auto', padding: '0 20px', minHeight: '80vh' },
  flexBox: { display: 'flex', gap: '50px', flexWrap: 'wrap' },
  imageSection: { flex: 1, minWidth: '350px' },
  mainImage: { width: '100%', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'cover' },
  infoSection: { flex: 1, minWidth: '350px' },
  category: { color: '#aaa', textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' },
  title: { fontSize: '32px', margin: '10px 0', color: '#2d3436', fontWeight: 'bold' },
  priceRow: { display: 'flex', alignItems: 'center', gap: '15px', margin: '10px 0' },
  price: { fontSize: '28px', color: '#e67e22', fontWeight: 'bold', margin: 0 },
  oldPrice: { fontSize: '18px', color: '#888', textDecoration: 'line-through', margin: 0 },
  divider: { height: '1px', background: '#eee', margin: '20px 0' },
  description: { lineHeight: '1.6', color: '#636e72' },
  sizeGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  sizeBtn: { 
    width: '50px', height: '50px', border: '1px solid', borderRadius: '8px', 
    cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' 
  },
  actionBox: { display: 'flex', gap: '15px', marginTop: '40px' },
  addCartBtn: { flex: 1, padding: '18px', background: '#fff', border: '2px solid #2d3436', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' },
  buyNowBtn: { flex: 1, padding: '18px', background: '#2d3436', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' }
};

export default ProductDetail;