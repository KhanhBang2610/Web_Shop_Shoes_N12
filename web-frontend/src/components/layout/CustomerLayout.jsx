import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const CustomerLayout = () => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadInitialData = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
    };

    loadInitialData();
    const checkUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
      else setUser(null);
    };
    
    checkUser();

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    
    // Lắng nghe thay đổi từ localStorage (cập nhật ngay khi đổi avatar/tên)
    window.addEventListener('storage', () => {
        checkUser();
        updateCartCount();
    });
    return () => {
        window.removeEventListener('storage', checkUser);
        window.removeEventListener('storage', updateCartCount);
    };
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm.trim()}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      <nav style={styles.header}>
        <div style={styles.container}>
          <div style={styles.leftSection}>
            <Link to="/" style={styles.logo}>👟 SHOES STORE</Link>
            <form onSubmit={handleSearch} style={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Tìm giày Nike, Adidas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>🔍</button>
            </form>
          </div>
          
          <div style={styles.menu}>
            <div style={styles.navGroup}>
              {/* Nút Giỏ hàng */}
              <Link to="/cart" style={styles.navLink}>
                <div style={styles.iconWrapper}>
                  <span style={{ fontSize: '22px' }}>🛒</span>
                  {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
                </div>
                <span>Giỏ hàng</span>
              </Link>

              {/* Nút Lịch sử */}
              <Link to="/purchase-history" style={styles.navLink}>
                <span style={{ fontSize: '22px' }}>📜</span>
                <span>Lịch sử</span>
              </Link>

              {/* Nút Đơn hàng */}
              <Link to="/orders" style={styles.navLink}>
                <span style={{ fontSize: '22px' }}>📦</span>
                <span>Đơn hàng</span>
              </Link>
            </div>
            <div style={styles.authSection}>
              {user ? (
                <>
                  <span style={styles.welcomeText}>Chào,</span>
                  {/* --- CỤM AVATAR + TÊN USER (CLICK VÀO PROFILE) --- */}
                  <Link to="/profile" style={styles.profileLink}>
                    {user.avatar ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={styles.headerAvatar} />
                    ) : (
                        <div style={styles.headerAvatarPlaceholder}>👤</div>
                    )}
                    <span style={styles.userName}>{user.fullname}</span>
                  </Link>
                  {/* ------------------------------------------------ */}
                  <button onClick={handleLogout} style={styles.logoutBtn}>Đăng xuất</button>
                </>
              ) : (
                <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  header: { background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' },
  leftSection: { display: 'flex', alignItems: 'center', gap: '30px', flex: 1 },
  logo: { fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#333', whiteSpace: 'nowrap' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#f1f2f6', borderRadius: '20px', padding: '5px 15px', width: '300px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', padding: '8px', fontSize: '14px', width: '100%' },
  searchBtn: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' },
  menu: { display: 'flex', gap: '20px', alignItems: 'center' },
  navItem: { textDecoration: 'none', color: '#555', fontWeight: '500', fontSize: '14px' },
  navGroup: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '25px', marginRight: '20px' },
  navLink: { display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#555', fontWeight: '500', fontSize: '14px' },
  iconWrapper: { position: 'relative' },
  cartBadge: { position: 'absolute', top: '-8px', right: '-10px', background: '#e74c3c', color: '#fff', fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' },
  authSection: { display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #eee', paddingLeft: '15px' },
  welcomeText: { fontSize: '14px', color: '#555' },
  
  // STYLE CHO AVATAR VÀ TÊN Ở HEADER
  profileLink: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', transition: 'background 0.2s' },
  headerAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' },
  headerAvatarPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', border: '1px solid #ddd' },
  userName: { fontWeight: 'bold', color: '#e67e22', fontSize: '14px' },
  
  logoutBtn: { background: 'none', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s', marginLeft: '5px' },
  loginLink: { textDecoration: 'none', color: '#fff', background: '#e67e22', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }
};

export default CustomerLayout;