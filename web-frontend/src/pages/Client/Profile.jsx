import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { Edit2, LogOut, Mail, User, Phone, MapPin, Calendar } from 'lucide-react';

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

  const handleSave = () => {
    // Cập nhật thông tin người dùng trong localStorage
    localStorage.setItem('user', JSON.stringify(formData));
    setUser(formData);
    setIsEditing(false);
    alert('✅ Cập nhật thông tin thành công!');
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
        <h3 style={styles.quickTitle}>🔗 Liên kết nhanh</h3>
        <div style={styles.linkGrid}>
          <button 
            onClick={() => navigate('/cart')}
            style={styles.linkBtn}
          >
            🛒 Giỏ hàng
          </button>
          <button 
            onClick={() => navigate('/purchase-history')}
            style={styles.linkBtn}
          >
            📜 Lịch sử mua hàng
          </button>
          <button 
            onClick={() => navigate('/my-orders')}
            style={styles.linkBtn}
          >
            📦 Đơn hàng
          </button>
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
=======
import { getProfile, updateProfile, isAuthenticated } from '../../api/authApi'; 

const Profile = () => {
    const [profile, setProfile] = useState({
        fullname: '',
        email: '',
        phone: '',
        address: '',
        avatar: '',
        role: ''
    });
    
    const [avatarFile, setAvatarFile] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [navigate]);

    const loadProfile = async () => {
        try {
            const response = await getProfile();
            setProfile(response.user);
        } catch (error) {
            console.error('Lỗi tải profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditClick = (e) => {
        e.preventDefault(); // Lệnh thần thánh: Chặn form tự động submit
        setIsEditing(true); // Bật chế độ chỉnh sửa
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('fullname', profile.fullname);
            formData.append('phone', profile.phone || '');
            formData.append('address', profile.address || '');
            
            if (profile.avatar) {
                formData.append('existing_avatar', profile.avatar);
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // Gọi API update
            const res = await updateProfile(formData); 
            
            // QUAN TRỌNG: Cập nhật lại localStorage để Header thay đổi ngay lập tức
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { 
                ...currentUser, 
                fullname: profile.fullname, 
                avatar: res.avatar || profile.avatar // URL avatar mới từ backend trả về
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('storage')); // Báo cho CustomerLayout biết

            alert('Cập nhật thông tin thành công!');
            setIsEditing(false);
            setAvatarFile(null); 
            loadProfile(); 

        } catch (error) {
            console.error('Lỗi cập nhật profile:', error);
            alert('Lỗi: Không thể cập nhật thông tin.');
        }
    };

    const handleCancel = () => {
        loadProfile();
        setIsEditing(false);
        setAvatarFile(null); 
    };

    if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>THÔNG TIN CÁ NHÂN</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* KHU VỰC AVATAR */}
                    <div style={{...styles.field, textAlign: 'center'}}>
                        <div style={styles.avatarContainer}>
                            {avatarFile ? (
                                // Hiển thị ảnh xem trước nếu vừa chọn file mới
                                <img src={URL.createObjectURL(avatarFile)} alt="Preview" style={styles.avatarImage} />
                            ) : profile.avatar ? (
                                <img src={`http://localhost:5000${profile.avatar}`} alt="Avatar" style={styles.avatarImage} />
                            ) : (
                                <div style={styles.avatarPlaceholder}>Chưa có ảnh</div>
                            )}
                        </div>
                        
                        {isEditing && (
                            <div style={{marginTop: '15px'}}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={styles.fileInput}
                                    id="avatar-upload"
                                />
                            </div>
                        )}
                    </div>

                    <div style={styles.row}>
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Họ và tên <span style={styles.req}>*</span></label>
                            <input
                                type="text" name="fullname"
                                value={profile.fullname || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                style={isEditing ? styles.input : styles.inputDisabled}
                                required
                            />
                        </div>

                        {/* TRƯỜNG EMAIL: KHÔNG THỂ CHỈNH SỬA VÀ CÓ MÀU XÁM */}
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Email (Không thể đổi)</label>
                            <input
                                type="email"
                                value={profile.email || ''}
                                disabled={true} // Khóa luôn luôn
                                style={styles.inputLocked} 
                            />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Số điện thoại</label>
                            <input
                                type="tel" name="phone"
                                value={profile.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                style={isEditing ? styles.input : styles.inputDisabled}
                                placeholder={isEditing ? "Nhập số điện thoại..." : "Chưa cập nhật"}
                            />
                        </div>

                        {/* TRƯỜNG VAI TRÒ: KHÔNG THỂ CHỈNH SỬA VÀ CÓ MÀU XÁM */}
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Vai trò hệ thống</label>
                            <input
                                type="text"
                                value={profile.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                                disabled={true} // Khóa luôn luôn
                                style={styles.inputLocked} 
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Địa chỉ giao hàng</label>
                        <textarea
                            name="address"
                            value={profile.address || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            style={isEditing ? styles.textarea : styles.textareaDisabled}
                            rows="3"
                            placeholder={isEditing ? "Nhập địa chỉ của bạn..." : "Chưa cập nhật"}
                        />
                    </div>

                    <div style={styles.buttonGroup}>
                        {isEditing ? (
                            <>
                                <button type="submit" style={styles.saveButton}>Lưu thay đổi</button>
                                <button type="button" onClick={handleCancel} style={styles.cancelButton}>Hủy bỏ</button>
                            </>
                        ) : (
                            <button type="button" onClick={handleEditClick} style={styles.editButton}>
                                ✏️ Chỉnh sửa thông tin
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '40px 20px' },
    card: { backgroundColor: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '700px' },
    title: { textAlign: 'center', marginBottom: '30px', color: '#2c3e50', fontSize: '26px', fontWeight: '800', borderBottom: '2px solid #eee', paddingBottom: '15px' },
    form: { display: 'flex', flexDirection: 'column' },
    row: { display: 'flex', gap: '20px', marginBottom: '20px' },
    fieldHalf: { flex: 1 },
    field: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#34495e', fontSize: '14px' },
    req: { color: '#e74c3c' },
    
    // STYLE CHO CÁC LOẠI INPUT
    input: { width: '100%', padding: '12px 15px', border: '1px solid #3498db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff', transition: 'border 0.3s' },
    inputDisabled: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fdfdfd', color: '#555' },
    
    // STYLE RIÊNG CHO TRƯỜNG BỊ KHÓA (EMAIL, ROLE)
    inputLocked: { width: '100%', padding: '12px 15px', border: '1px solid #dcdde1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#f1f2f6', color: '#7f8fa6', cursor: 'not-allowed', fontWeight: '500' },
    
    textarea: { width: '100%', padding: '12px 15px', border: '1px solid #3498db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' },
    textareaDisabled: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', backgroundColor: '#fdfdfd', color: '#555' },
    
    buttonGroup: { display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' },
    editButton: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'transform 0.2s', width: '100%' },
    saveButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', flex: 1 },
    cancelButton: { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', flex: 1 },
    loading: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#7f8c8d' },
    
    avatarContainer: { display: 'flex', justifyContent: 'center', position: 'relative' },
    avatarImage: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    avatarPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a4b0be', border: '2px dashed #ced6e0', fontSize: '14px' },
    fileInput: { fontSize: '14px', color: '#555' }
};

export default Profile;
>>>>>>> 9eb5109a66d68cb26697e7aeea24c4ee8fc433f2
