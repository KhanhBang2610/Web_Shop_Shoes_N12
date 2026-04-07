import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, LogOut, Mail, User, Phone, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const loadUserData = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        setFormData(storedUser);
      } else {
        // Chuyển hướng đến đăng nhập nếu chưa đăng nhập
        navigate('/login');
      }
      setLoading(false);
    };
    loadUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Cập nhật thông tin người dùng trong localStorage
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/update/${user.id}`, formData);

      const updatedUser = { ...user, ...formData };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert('✅ Cập nhật thông tin thành công!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header với button đăng xuất */}
      <div style={styles.header}>
        <h2 style={styles.title}>👤 THÔNG TIN CÁ NHÂN</h2>
        <div style={styles.headerActions}>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={styles.editBtn}
          >
            <Edit2 size={18} /> {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
          
        </div>
      </div>

      {/* Nội dung chính */}
      <div style={styles.profileCard}>
        {isEditing ? (
          // Chế độ chỉnh sửa
          <div style={styles.editForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                style={styles.input}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>👤 Họ và tên:</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📱 Số điện thoại:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>📍 Địa chỉ:</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🏙️ Thành phố:</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Nhập thành phố"
              />
            </div>

            <button 
              onClick={handleSave}
              style={styles.saveBtn}
            >
              💾 Lưu thay đổi
            </button>
          </div>
        ) : (
          // Chế độ xem
          <div style={styles.viewForm}>
            <div style={styles.infoRow}>
              <div style={styles.infoIcon}>
                <Mail size={24} color="#e67e22" />
              </div>
              <div>
                <p style={styles.infoLabel}>Email</p>
                <p style={styles.infoValue}>{user?.email || 'Không có thông tin'}</p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoIcon}>
                <User size={24} color="#3498db" />
              </div>
              <div>
                <p style={styles.infoLabel}>Họ và tên</p>
                <p style={styles.infoValue}>{user?.fullname || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoIcon}>
                <Phone size={24} color="#27ae60" />
              </div>
              <div>
                <p style={styles.infoLabel}>Số điện thoại</p>
                <p style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoIcon}>
                <MapPin size={24} color="#e74c3c" />
              </div>
              <div>
                <p style={styles.infoLabel}>Địa chỉ</p>
                <p style={styles.infoValue}>{user?.address || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div style={styles.infoRow}>
              <div style={styles.infoIcon}>
                <MapPin size={24} color="#9b59b6" />
              </div>
              <div>
                <p style={styles.infoLabel}>Thành phố</p>
                <p style={styles.infoValue}>{user?.city || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Các liên kết nhanh */}
      <div style={styles.quickLinks}>
        <div style={styles.linkGrid}>
          <button 
            onClick={() => navigate('/')}
            style={styles.linkBtn}
          >
            🏠 Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '0 20px',
    minHeight: '70vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #eee'
  },
  title: {
    fontSize: '28px',
    color: '#2d3436',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  editBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  profileCard: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  viewForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  input: {
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    transition: '0.3s'
  },
  infoRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    backgroundColor: '#f9f9f9',
    borderRadius: '50%'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
    marginBottom: '5px',
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: '16px',
    color: '#2d3436',
    margin: 0,
    fontWeight: '500'
  },
  saveBtn: {
    padding: '12px 30px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
    marginTop: '20px'
  },
  quickLinks: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '30px'
  },
  quickTitle: {
    fontSize: '18px',
    color: '#2d3436',
    marginTop: 0,
    marginBottom: '15px'
  },
  linkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px'
  },
  linkBtn: {
    padding: '12px 16px',
    backgroundColor: 'white',
    color: '#2d3436',
    border: '2px solid #e67e22',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  }
};

export default Profile;
