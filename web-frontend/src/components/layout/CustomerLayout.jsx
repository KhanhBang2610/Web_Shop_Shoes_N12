import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, Package, History, ChevronDown } from 'lucide-react';
import { getCart } from '../../utils/cartUtils';
import { NavLink } from 'react-router-dom';

const CustomerLayout = () => {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // Quản lý việc ẩn/hiện menu dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); 

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
      else setUser(null);
    };
    checkUser();

    const updateCartCount = () => {
      const cart = getCart();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    };
    updateCartCount();
    
    window.addEventListener('storage', () => {
        checkUser();
        updateCartCount();
    });

    // Bắt sự kiện click ra ngoài để tự động đóng dropdown
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        window.removeEventListener('storage', checkUser);
        window.removeEventListener('storage', updateCartCount);
        document.removeEventListener("mousedown", handleClickOutside);
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
    window.dispatchEvent(new Event('storage'));
    setUser(null);
    setIsDropdownOpen(false); 
    navigate('/');
  };

  return (
    <div>
      <nav style={styles.header}>
        <div style={styles.container}>
            
          {/* LOGO & MAIN LINKS (Gộp từ file của Vũ) */}

          <div style={styles.leftSection}>
            <Link to="/" style={styles.logo}>👟 SHOES STORE</Link>
             <div style={styles.rightSection}>

            {/* THANH TÌM KIẾM */}
            <form onSubmit={handleSearch} style={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Tìm giày Nike, Adidas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>
                  <Search size={18} color="#666" />
              </button>
            </form>
            <ul style={styles.navLinks}>
              <li>
                <NavLink 
                  to="/brands" 
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    color: isActive ? '#e67e22' : '#333',
                    fontWeight: 'normal'
                  })}
                >
                  <span>🌟</span>
                  <span>Thương hiệu</span>
                </NavLink>
              </li>
            </ul>
          </div>
          
            {/* Nút Khuyến mãi */}
            <NavLink 
              to="/promotions" 
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#e67e22' : '#333'
              })}
            >
              <span>🏷️</span>
              <span>Khuyến mãi</span>
            </NavLink>

            {/* Nút Lịch sử */}
      
            <NavLink 
              to="/purchase-history" 
              style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#e67e22' : '#333'
              })}
            >
              <span>📜</span>
              <span>Lịch sử</span>
            </NavLink>

            {/* GIỎ HÀNG */}
            <Link to="/cart" style={styles.cartWrapper}>
              <ShoppingCart size={24} color="#333" />
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </Link>

            {/* KHU VỰC USER (DROPDOWN) */}
            <div style={styles.authSection}>
              {user ? (
                <div style={styles.dropdownContainer} ref={dropdownRef}>
                  <div style={styles.userTrigger} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    {user.avatar ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" style={styles.headerAvatar} />
                    ) : (
                        <div style={styles.headerAvatarPlaceholder}><User size={16} color="#666" /></div>
                    )}
                    <span style={styles.userName}>{user.fullname}</span>
                    <ChevronDown size={14} color="#666" />
                  </div>

                  {/* MENU THẢ XUỐNG CÁC TÍNH NĂNG */}
                  {isDropdownOpen && (
                      <div style={styles.dropdownMenu}>
                          <Link to="/profile" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                              <User size={16} /> Thông tin tài khoản
                          </Link>
                          <Link to="/orders" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                              <Package size={16} /> Đơn hàng của tôi
                          </Link>
                          <Link to="/purchase-history" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                              <History size={16} /> Lịch sử mua hàng
                          </Link>
                          <div style={styles.divider}></div>
                          <button onClick={handleLogout} style={styles.dropdownItemLogout}>
                              <LogOut size={16} /> Đăng xuất
                          </button>
                      </div>
                  )}
                </div>
              ) : (
                <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main style={{ minHeight: '80vh', backgroundColor: '#fdfdfd' }}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  header: { background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' },
  
  leftSection: { display: 'flex', alignItems: 'center', gap: '30px' },
  logo: { fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#333', whiteSpace: 'nowrap' },
  navLinks: { display: 'flex', listStyle: 'none', gap: '20px', margin: 0, padding: 0 },
  link: { textDecoration: 'none', color: '#555', fontWeight: '600', fontSize: '15px', transition: 'color 0.2s' },
  
  rightSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#f1f2f6', borderRadius: '20px', padding: '6px 15px', width: '250px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', padding: '5px', fontSize: '14px', width: '100%' },
  searchBtn: { border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  
  cartWrapper: { position: 'relative', textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: '-6px', right: '-8px', background: '#e74c3c', color: '#fff', fontSize: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' },
  authSection: { borderLeft: '1px solid #eee', paddingLeft: '15px' },
  loginLink: { textDecoration: 'none', color: '#fff', background: '#e67e22', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' },

  // --- STYLES CHO DROPDOWN MENU CHUYÊN NGHIỆP ---
  dropdownContainer: { position: 'relative' },
  userTrigger: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '5px 10px', borderRadius: '20px', backgroundColor: '#f9f9f9', border: '1px solid #eee', transition: 'background 0.2s' },
  headerAvatar: { width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' },
  headerAvatarPlaceholder: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  userName: { fontWeight: '600', color: '#333', fontSize: '14px' },
  
  dropdownMenu: { position: 'absolute', top: '115%', right: 0, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '200px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #eee', zIndex: 101 },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', textDecoration: 'none', color: '#333', fontSize: '14px', transition: 'background 0.2s', fontWeight: '500' },
  divider: { height: '1px', backgroundColor: '#eee', margin: '0' },
  dropdownItemLogout: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', color: '#e74c3c', fontSize: '14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', fontWeight: '600' }
};

export default CustomerLayout;