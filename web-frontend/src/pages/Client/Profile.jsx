import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, isAuthenticated } from '../../api/authApi'; 

const Profile = () => {
    const [profile, setProfile] = useState({ fullname: '', email: '', phone: '', address: '', avatar: '', role: '' });
    const [avatarFile, setAvatarFile] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({}); 
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

    const validateField = (name, value) => {
        let errorMsg = '';
        if (name === 'fullname') {
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
            if (!value.trim()) errorMsg = "Họ tên không được để trống.";
            else if (!nameRegex.test(value)) errorMsg = "Họ tên không hợp lệ (Không chứa số hay ký tự đặc biệt).";
        }
        if (name === 'phone') {
            const cleanPhone = value.replace(/[\s\-]/g, ''); 
            const phoneRegex = /^\+?[0-9]{7,15}$/;
            if (value.trim() !== '' && !phoneRegex.test(cleanPhone)) {
                errorMsg = "Số điện thoại không hợp lệ (Phải từ 7 đến 15 số, có thể bắt đầu bằng +).";
            }
        }
        return errorMsg;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, avatar: "File ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB." });
                e.target.value = ''; 
                setAvatarFile(null);
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, avatar: "Chỉ được phép tải lên file hình ảnh (JPG, PNG)." });
                e.target.value = '';
                setAvatarFile(null);
                return;
            }
            setErrors({ ...errors, avatar: '' }); 
            setAvatarFile(file);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault(); 
        setIsEditing(true); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let newErrors = {};
        newErrors.fullname = validateField('fullname', profile.fullname);
        newErrors.phone = validateField('phone', profile.phone || '');

        Object.keys(newErrors).forEach(key => !newErrors[key] && delete newErrors[key]);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('fullname', profile.fullname);
            formData.append('phone', profile.phone || '');
            formData.append('address', profile.address || '');
            if (profile.avatar) formData.append('existing_avatar', profile.avatar);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await updateProfile(formData); 
            
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, fullname: profile.fullname, avatar: res.avatar || profile.avatar };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('storage'));

            alert('Cập nhật thông tin thành công!');
            setIsEditing(false);
            setAvatarFile(null); 
            loadProfile(); 

        } catch (error) {
            setErrors({ ...errors, submit: "Lỗi hệ thống! Không thể cập nhật lúc này." });
        }
    };

    const handleCancel = () => {
        loadProfile();
        setIsEditing(false);
        setAvatarFile(null); 
        setErrors({});
    };

    if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>THÔNG TIN CÁ NHÂN</h2>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {errors.submit && <div style={styles.serverError}>{errors.submit}</div>}

                    <div style={{...styles.field, textAlign: 'center'}}>
                        <div style={styles.avatarContainer}>
                            {avatarFile ? (
                                <img src={URL.createObjectURL(avatarFile)} alt="Preview" style={styles.avatarImage} />
                            ) : profile.avatar ? (
                                <img src={`http://localhost:5000${profile.avatar}`} alt="Avatar" style={styles.avatarImage} />
                            ) : (
                                <div style={styles.avatarPlaceholder}>👤</div>
                            )}
                        </div>
                        {isEditing && (
                            <div style={{marginTop: '15px'}}>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
                                {errors.avatar && <div style={styles.errorTextCenter}>{errors.avatar}</div>}
                            </div>
                        )}
                    </div>

                    <div style={styles.row}>
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Họ và tên <span style={styles.req}>*</span></label>
                            <input type="text" name="fullname" value={profile.fullname || ''} onChange={handleInputChange} onBlur={handleBlur} disabled={!isEditing} style={errors.fullname ? {...(isEditing ? styles.input : styles.inputDisabled), border: '1px solid #c0392b'} : (isEditing ? styles.input : styles.inputDisabled)} />
                            {errors.fullname && <div style={styles.errorText}>{errors.fullname}</div>}
                        </div>

                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Email (Không thể đổi)</label>
                            <input type="email" value={profile.email || ''} disabled={true} style={styles.inputLocked} />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Số điện thoại</label>
                            <input type="tel" name="phone" value={profile.phone || ''} onChange={handleInputChange} onBlur={handleBlur} disabled={!isEditing} placeholder={isEditing ? "VD: 0912345678 hoặc +84..." : "Chưa cập nhật"} style={errors.phone ? {...(isEditing ? styles.input : styles.inputDisabled), border: '1px solid #c0392b'} : (isEditing ? styles.input : styles.inputDisabled)} />
                            {errors.phone && <div style={styles.errorText}>{errors.phone}</div>}
                        </div>

                        <div style={styles.fieldHalf}>
                            <label style={styles.label}>Vai trò hệ thống</label>
                            <input type="text" value={profile.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'} disabled={true} style={styles.inputLocked} />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Địa chỉ giao hàng</label>
                        <textarea name="address" value={profile.address || ''} onChange={handleInputChange} disabled={!isEditing} style={isEditing ? styles.textarea : styles.textareaDisabled} rows="3" placeholder={isEditing ? "Nhập địa chỉ của bạn..." : "Chưa cập nhật"} />
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
    row: { display: 'flex', gap: '20px', marginBottom: '15px' },
    fieldHalf: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
    field: { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { display: 'block', fontWeight: '600', color: '#34495e', fontSize: '14px' },
    req: { color: '#e74c3c' },
    
    input: { width: '100%', padding: '12px 15px', border: '1px solid #3498db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff', transition: 'border 0.3s' },
    inputDisabled: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#fdfdfd', color: '#555' },
    inputLocked: { width: '100%', padding: '12px 15px', border: '1px solid #dcdde1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: '#f1f2f6', color: '#7f8fa6', cursor: 'not-allowed', fontWeight: '500' },
    textarea: { width: '100%', padding: '12px 15px', border: '1px solid #3498db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', outline: 'none' },
    textareaDisabled: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical', backgroundColor: '#fdfdfd', color: '#555' },
    
    errorText: { color: '#c0392b', fontSize: '13px', fontWeight: 'bold', marginTop: '2px', display: 'block' },
    errorTextCenter: { color: '#c0392b', fontSize: '13px', fontWeight: 'bold', marginTop: '5px', textAlign: 'center' },
    serverError: { padding: '10px', backgroundColor: '#fdf3f2', border: '1px solid #fadbd8', color: '#c0392b', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' },
    
    buttonGroup: { display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' },
    editButton: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' },
    saveButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', flex: 1 },
    cancelButton: { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', flex: 1 },
    loading: { textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#7f8c8d' },
    avatarContainer: { display: 'flex', justifyContent: 'center', position: 'relative' },
    avatarImage: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    avatarPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f2f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a4b0be', border: '2px dashed #ced6e0', fontSize: '40px' },
    fileInput: { fontSize: '14px', color: '#555' }
};

export default Profile;