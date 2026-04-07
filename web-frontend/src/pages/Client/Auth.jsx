import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [view, setView] = useState('login'); 
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (location.pathname.includes('/register')) setView('register');
        else if (location.pathname.includes('/forgot-password')) setView('forgot');
        else setView('login');
        
        setErrors({});
        setFormData({ fullname: '', email: '', password: '' });
    }, [location.pathname]);

    // HÀM KIỂM TRA LỖI RIÊNG LẺ TỪNG TRƯỜNG
    const validateField = (name, value, currentView) => {
        let errorMsg = '';
        if (name === 'fullname' && currentView === 'register') {
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
            if (!value.trim()) errorMsg = "Họ tên không được để trống.";
            else if (!nameRegex.test(value)) errorMsg = "Họ tên chỉ được chứa chữ cái, không chứa số hay ký tự đặc biệt.";
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

    // Khi người dùng RỜI KHỎI ô nhập liệu (Nhập xong) -> Báo lỗi ngay lập tức
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMsg = validateField(name, value, view);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    // Khi người dùng BẮT ĐẦU GÕ LẠI -> Ẩn lỗi đi cho đỡ phiền
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra lại toàn bộ trước khi gửi API
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
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token); 
                if (res.data.user.role === 'admin') navigate('/admin/dashboard');
                else navigate('/'); 
                window.dispatchEvent(new Event('storage'));
            } else if (view === 'register') {
                await axios.post('http://localhost:5000/api/register', formData);
                alert("Đăng ký thành công! Hãy đăng nhập nhé.");
                navigate('/login');
            }
        } catch (error) {
            const serverMsg = error.response?.data?.message || "Lỗi hệ thống!";
            if (serverMsg.toLowerCase().includes('mật khẩu')) setErrors({ ...errors, password: serverMsg });
            else if (serverMsg.toLowerCase().includes('email')) setErrors({ ...errors, email: serverMsg });
            else setErrors({ ...errors, submit: serverMsg });
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                .auth-input:focus { border-color: #e67e22 !important; box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2); }
                .auth-btn:hover { background-color: #d35400 !important; transform: translateY(-2px); }
                .auth-link:hover { text-decoration: underline; }
            `}</style>
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
                                        <input type="password" name="password" placeholder="Mật khẩu" className="auth-input" style={errors.password ? {...styles.input, ...styles.inputError} : styles.input} onChange={handleInputChange} onBlur={handleBlur} />
                                        {errors.password && <div style={styles.errorText}>{errors.password}</div>}
                                    </div>
                                    
                                    {view === 'login' && <Link to="/forgot-password" style={styles.forgotPassword}>Quên mật khẩu?</Link>}

                                    <button type="submit" className="auth-btn" style={styles.button}>
                                        {view === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ NGAY'}
                                    </button>
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
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#eef2f5', padding: '20px' },
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
    // MÀU LỖI IN ĐẬM RÕ RÀNG
    errorText: { color: '#c0392b', fontSize: '13px', fontWeight: 'bold', marginTop: '4px', textAlign: 'left', display: 'block' },
    serverError: { padding: '10px', backgroundColor: '#fdf3f2', border: '1px solid #fadbd8', color: '#c0392b', borderRadius: '8px', fontSize: '14px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' },

    forgotPassword: { textAlign: 'right', fontSize: '13px', color: '#e67e22', cursor: 'pointer', marginTop: '-5px', fontWeight: '500', textDecoration: 'none' },
    button: { padding: '15px', borderRadius: '10px', border: 'none', background: '#e67e22', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)', marginTop: '5px' },
    switchText: { marginTop: '25px', fontSize: '15px', color: '#666', textAlign: 'center' },
    link: { color: '#e67e22', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', textDecoration: 'none', marginLeft: '5px' }
};

export default Auth;