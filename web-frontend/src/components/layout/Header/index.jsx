<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, History } from 'lucide-react'; // Sử dụng icon cho xịn
=======
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ShoppingCart, Search, User, LogOut } from 'lucide-react';
>>>>>>> 9eb5109a66d68cb26697e7aeea24c4ee8fc433f2

// const Header = () => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   // Kiểm tra liên tục xem có user đăng nhập không
//   useEffect(() => {
//     const checkUser = () => {
//       const userData = localStorage.getItem('user');
//       if (userData) setUser(JSON.parse(userData));
//       else setUser(null);
//     };
//     checkUser();
//     // Lắng nghe thay đổi (dành cho lúc vừa login xong)
//     window.addEventListener('storage', checkUser);
//     return () => window.removeEventListener('storage', checkUser);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     setUser(null);
//     navigate('/login'); 
//     window.location.reload(); // Reset lại toàn bộ state
//   };

//   return (
//     <nav className="header" style={styles.nav}>
//       <div className="logo" style={styles.logo}>
//         <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '24px' }}>
//           👟 SHOE STORE
//         </Link>
//       </div>
      
//       <ul className="nav-links" style={styles.navLinks}>
//         <li style={styles.li}><Link to="/shop" style={styles.link}>Cửa hàng</Link></li>
//         <li style={styles.li}><Link to="/brands" style={styles.link}>Thương hiệu</Link></li>
//         <li style={styles.li}><Link to="/sale" style={styles.link}>Giảm giá</Link></li>
//       </ul>

<<<<<<< HEAD
      <div className="header-actions">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm giày..." />
          <Search size={20} />
        </div>
        <Link to="/cart" className="cart-icon">
          <ShoppingCart />
          <span className="cart-count">0</span>
        </Link>
        <Link to="/purchase-history" className="history-icon" title="Lịch sử mua hàng">
          <History size={20} />
        </Link>
        <Link to="/profile"><User /></Link>
      </div>
    </nav>
  );
};
=======
//       <div className="header-actions" style={styles.headerActions}>
//         <div className="search-box" style={styles.searchBox}>
//           <input type="text" placeholder="Tìm kiếm giày..." style={styles.searchInput} />
//           <Search size={20} color="#666" style={{ cursor: 'pointer' }} />
//         </div>
        
//         <Link to="/cart" className="cart-icon" style={styles.iconWrapper}>
//           <ShoppingCart size={24} color="#333" />
//           <span style={styles.cartBadge}>0</span>
//         </Link>
>>>>>>> 9eb5109a66d68cb26697e7aeea24c4ee8fc433f2

//         {/* --- KHU VỰC USER TRỰC QUAN --- */}
//         {user ? (
//           <div style={styles.loggedInUser}>
//              <Link to="/profile" style={styles.profileBtn}>
//                 <User size={18} /> {user.fullname}
//              </Link>
//              <button onClick={handleLogout} style={styles.logoutBtn}>
//                 <LogOut size={18} /> Thoát
//              </button>
//           </div>
//         ) : (
//           <Link to="/login" style={styles.iconWrapper}>
//              <User size={24} color="#333" />
//           </Link>
//         )}
//         {/* ------------------------------- */}
        
//       </div>
//     </nav>
//   );
// };

// const styles = {
//   nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
//   logo: { flex: 1 },
//   navLinks: { display: 'flex', listStyle: 'none', gap: '30px', flex: 2, justifyContent: 'center', margin: 0, padding: 0 },
//   li: { fontSize: '16px', fontWeight: '500' },
//   link: { textDecoration: 'none', color: '#333' },
//   headerActions: { display: 'flex', gap: '20px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
//   searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '8px 15px', borderRadius: '20px' },
//   searchInput: { border: 'none', backgroundColor: 'transparent', outline: 'none', paddingRight: '10px' },
//   iconWrapper: { position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' },
//   cartBadge: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#e74c3c', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' },
  
//   // Style mới cho cụm Profile
//   loggedInUser: { display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #ddd', paddingLeft: '15px' },
//   profileBtn: { display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#e67e22', fontWeight: '600', fontSize: '15px' },
//   logoutBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: '600', fontSize: '15px', padding: 0 }
// };

// export default Header;