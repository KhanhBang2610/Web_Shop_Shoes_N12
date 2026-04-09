import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [view, setView] = useState('login'); 
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    
    // STATE MỚI: Dùng để điều khiển hiển thị thông báo mượt mà (Toast)
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (location.pathname.includes('/register')) setView('register'); // eslint-disable-line react-hooks/set-state-in-effect
        else if (location.pathname.includes('/forgot-password')) setView('forgot');
        else setView('login');
        
        setErrors({});
        setFormData(prev => ({ 
            fullname: '', 
            email: prev.email, 
            password: ''       
        }));
    }, [location.pathname]);

    const validateField = (name, value, currentView) => {
    let errorMsg = '';
    
    if (name === 'fullname' && currentView === 'register') {
        // K tra không được để trống (hoặc toàn khoảng trắng)
        if (!value.trim()) errorMsg = "Họ tên không được để trống.";
    }
    
    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) errorMsg = "Email không được để trống.";
        else if (!emailRegex.test(value)) errorMsg = "Định dạng email không hợp lệ (VD: abc@gmail.com).";
    }
    
    if (name === 'password' && currentView !== 'forgot') {
        if (!value) errorMsg = "Mật khẩu không được để trống.";
        else if (/\s/.test(value)) errorMsg = "Mật khẩu không được chứa khoảng trắng.";
        else if (value.length < 8) errorMsg = "Mật khẩu phải từ 8 ký tự trở lên.";
        else if (value.length > 32) errorMsg = "Mật khẩu không được vượt quá 32 ký tự.";
    }
    
    return errorMsg;
};

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value, view);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let newErrors = {};
        if (view === 'register') newErrors.fullname = validateField('fullname', formData.fullname, view);
        newErrors.email = validateField('email', formData.email, view);
        if (view !== 'forgot') newErrors.password = validateField('password', formData.password, view);

        Object.keys(newErrors).forEach(key => !newErrors[key] && delete newErrors[key]);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (view === 'login') {
                const res = await axios.post('http://localhost:5000/api/login', {
                    email: formData.email,
                    password: formData.password
                });
                
                localStorage.setItem('user', JSON.stringify(res.data.data.user));
                localStorage.setItem('token', res.data.data.token); 
                window.dispatchEvent(new Event('storage'));

                // HIỂN THỊ TOAST VÀ ĐỢI 1.5 GIÂY RỒI MỚI CHUYỂN TRANG
                setToastMessage("🎉 Đăng nhập thành công!");
                setTimeout(() => {
                    if (res.data.data.user.role === 'admin') navigate('/admin/dashboard');
                    else navigate('/'); 
                }, 1500);

            } else if (view === 'register') {
                const res = await axios.post('http://localhost:5000/api/register', formData);
                
                localStorage.setItem('user', JSON.stringify(res.data.data.user));
                localStorage.setItem('token', res.data.data.token);
                window.dispatchEvent(new Event('storage'));

                // HIỂN THỊ TOAST VÀ ĐỢI 1.5 GIÂY RỒI MỚI CHUYỂN TRANG
                setToastMessage("✨ Chào mừng! Bạn đã đăng ký thành công.");
                setTimeout(() => {
                    navigate('/'); 
                }, 1500);
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message || "Lỗi hệ thống!";
            if (serverMsg.toLowerCase().includes('mật khẩu')) setErrors({ ...errors, password: serverMsg });
            else if (serverMsg.toLowerCase().includes('email')) setErrors({ ...errors, email: serverMsg });
            else setErrors({ ...errors, submit: serverMsg });
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
        // 1. Gửi token nhận được từ Google xuống Backend của bạn
        const res = await axios.post('http://localhost:5000/api/auth/google', {
            credential: credentialResponse.credential,
        });

        // 2. Nếu Backend báo thành công
        if (res.data.success) {
            // Lưu Token và Thông tin user vào Local Storage
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));

            alert(res.data.message || "Đăng nhập Google thành công!");
            
            // 3. Chuyển hướng về trang chủ
            // Nếu bạn dùng window.location.href thì trang sẽ load lại để Header cập nhật ảnh đại diện luôn
            window.location.href = '/'; 
        }
        } catch (error) {
        console.error("Lỗi xác thực Google từ Server:", error);
        alert(error.response?.data?.message || "Đăng nhập Google thất bại! Vui lòng thử lại.");
        }
    };
    return (
        <div style={styles.container}>
            {/* THÊM CSS ANIMATION CHO TOAST TRƯỢT TỪ TRÊN XUỐNG */}
            <style>{`
                .auth-input:focus { border-color: #e67e22 !important; box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2); }
                .auth-btn:hover { background-color: #d35400 !important; transform: translateY(-2px); }
                .auth-link:hover { text-decoration: underline; }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* HIỂN THỊ THÔNG BÁO TOAST Ở GÓC MÀN HÌNH */}
            {toastMessage && (
                <div style={styles.toast}>
                    {toastMessage}
                </div>
            )}

            <div style={styles.card}>
                <div style={styles.imageSection}>
                    <div style={styles.overlay}>
                        <h1 style={styles.slogan}>Bước đi phong cách</h1>
                        <p style={styles.subSlogan}>Khám phá bộ sưu tập giày Sneaker đỉnh nhất năm nay.</p>
                    </div>
                </div>

                <div style={styles.formSection}>
                    <div style={styles.formWrapper}>
                        {view === 'forgot' ? (
                            <>
                                <h2 style={styles.title}>Khôi Phục Mật Khẩu</h2>
                                <p style={styles.subtitle}>Nhập email của bạn để nhận hướng dẫn khôi phục.</p>
                                <form style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <input type="email" name="email" placeholder="Địa chỉ Email của bạn" className="auth-input" style={styles.input} onChange={handleInputChange} onBlur={handleBlur} />
                                        {errors.email && <div style={styles.errorText}>{errors.email}</div>}
                                    </div>
                                    <button type="button" className="auth-btn" style={styles.button}>GỬI YÊU CẦU</button>
                                </form>
                                <p style={styles.switchText}>Nhớ lại mật khẩu rồi? <Link to="/login" className="auth-link" style={styles.link}>Đăng nhập</Link></p>
                            </>
                        ) : (
                            <>
                                <h2 style={styles.title}>{view === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản'}</h2>
                                <p style={styles.subtitle}>{view === 'login' ? 'Vui lòng đăng nhập để tiếp tục.' : 'Tham gia cùng chúng tôi ngay hôm nay!'}</p>

                                <form onSubmit={handleSubmit} style={styles.form}>
                                    {errors.submit && <div style={styles.serverError}>{errors.submit}</div>}

                                    {view === 'register' && (
                                        <div style={styles.inputGroup}>
                                            <input type="text" name="fullname" placeholder="Họ và tên của bạn" className="auth-input" style={errors.fullname ? {...styles.input, ...styles.inputError} : styles.input} onChange={handleInputChange} onBlur={handleBlur} />
                                            {errors.fullname && <div style={styles.errorText}>{errors.fullname}</div>}
                                        </div>
                                    )}
                                    
                                    <div style={styles.inputGroup}>
                                        <input type="email" name="email" placeholder="Địa chỉ Email" className="auth-input" style={errors.email ? {...styles.input, ...styles.inputError} : styles.input} onChange={handleInputChange} onBlur={handleBlur} />
                                        {errors.email && <div style={styles.errorText}>{errors.email}</div>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            placeholder="Mật khẩu" 
                                            autoComplete="new-password"
                                            value={formData.password}
                                            className="auth-input" 
                                            style={errors.password ? {...styles.input, ...styles.inputError} : styles.input} 
                                            onChange={handleInputChange} 
                                            onBlur={handleBlur} 
                                        />
                                        {errors.password && <div style={styles.errorText}>{errors.password}</div>}
                                    </div>
                                    
                                    {view === 'login' && <Link to="/forgot-password" style={styles.forgotPassword}>Quên mật khẩu?</Link>}

                                    <button type="submit" className="auth-btn" style={styles.button}>
                                        {view === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ NGAY'}
                                    </button>
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
                                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
                                            <span style={{ padding: '0 10px', color: '#888', fontSize: '14px' }}>Hoặc</span>
                                            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
                                        </div>

                                        {/* Nút Google */}
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => {
                                                console.log('Đăng nhập Google thất bại');
                                                alert('Có lỗi xảy ra khi kết nối với Google!');
                                            }}
                                            shape="rectangular" // Hình chữ nhật cho hợp với form
                                            size="large" // Nút to
                                            text="signin_with" // Hiển thị chữ "Sign in with Google"
                                            />
                                        </div>
                                    </div>
                                </form>
                                <p style={styles.switchText}>
                                    {view === 'login' ? "Chưa có tài khoản?" : "Đã có tài khoản?"} 
                                    <Link to={view === 'login' ? "/register" : "/login"} className="auth-link" style={styles.link}>
                                        {view === 'login' ? " Đăng ký tại đây" : " Đăng nhập ngay"}
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#eef2f5', padding: '20px', position: 'relative' },
    card: { display: 'flex', background: '#fff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', width: '100%', maxWidth: '900px', overflow: 'hidden', minHeight: '500px' },
    imageSection: { flex: 1, backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'flex-end' },
    overlay: { background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))', padding: '40px', width: '100%', color: 'white' },
    slogan: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' },
    subSlogan: { fontSize: '16px', opacity: 0.9, margin: 0 },
    formSection: { flex: 1, padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
    formWrapper: { width: '100%', maxWidth: '350px' },
    title: { fontSize: '28px', color: '#333', fontWeight: 'bold', marginBottom: '10px' },
    subtitle: { fontSize: '15px', color: '#666', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { padding: '15px', borderRadius: '10px', border: '1px solid #e1e1e1', fontSize: '15px', outline: 'none', transition: 'all 0.3s ease', backgroundColor: '#f9f9f9', width: '100%', boxSizing: 'border-box' },
    inputError: { border: '1px solid #c0392b', backgroundColor: '#fdf3f2' },
    errorText: { color: '#c0392b', fontSize: '13px', fontWeight: 'bold', marginTop: '4px', textAlign: 'left', display: 'block' },
    serverError: { padding: '10px', backgroundColor: '#fdf3f2', border: '1px solid #fadbd8', color: '#c0392b', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' },

    forgotPassword: { textAlign: 'right', fontSize: '13px', color: '#e67e22', cursor: 'pointer', marginTop: '-5px', fontWeight: '500', textDecoration: 'none' },
    button: { padding: '15px', borderRadius: '10px', border: 'none', background: '#e67e22', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)', marginTop: '5px' },
    switchText: { marginTop: '25px', fontSize: '15px', color: '#666', textAlign: 'center' },
    link: { color: '#e67e22', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', textDecoration: 'none', marginLeft: '5px' },

    // CSS CHO TOAST XỊN XÒ
    toast: {
        position: 'fixed',
        top: '30px',
        right: '30px',
        backgroundColor: '#27ae60', // Màu xanh lá báo thành công
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '10px',
        boxShadow: '0 8px 25px rgba(39, 174, 96, 0.3)',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 9999,
        animation: 'slideDown 0.4s ease-out forwards', // Gọi animation vừa tạo
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }
};

export default Auth;