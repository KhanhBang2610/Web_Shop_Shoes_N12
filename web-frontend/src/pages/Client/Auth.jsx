import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Bắt URL hiện tại
    
    // view có thể là: 'login', 'register', hoặc 'forgot'
    const [view, setView] = useState('login'); 
    const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });

    // Tự động chuyển đổi giao diện dựa trên URL path
    useEffect(() => {
        if (location.pathname.includes('/register')) setView('register');
        else if (location.pathname.includes('/forgot-password')) setView('forgot');
        else setView('login');
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                
                // Dùng event để báo cho Header update lại UI ngay lập tức
                window.dispatchEvent(new Event('storage'));
                
            } else if (view === 'register') {
                await axios.post('http://localhost:5000/api/register', formData);
                alert("Đăng ký thành công! Hãy đăng nhập nhé.");
                navigate('/login'); // Chuyển đường dẫn sang trang login
            }
        } catch (error) {
            alert(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        // Sau này bạn có thể viết API gửi email thực tế ở backend
        alert(`Một đường link khôi phục đã được gửi đến email: ${formData.email} (Demo tính năng)`);
        navigate('/login');
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
                        
                        {/* --- GIAO DIỆN QUÊN MẬT KHẨU --- */}
                        {view === 'forgot' ? (
                            <>
                                <h2 style={styles.title}>Khôi Phục Mật Khẩu</h2>
                                <p style={styles.subtitle}>Nhập email của bạn để nhận hướng dẫn khôi phục.</p>
                                <form onSubmit={handleForgotPassword} style={styles.form}>
                                    <input 
                                        type="email" placeholder="Địa chỉ Email của bạn" required
                                        className="auth-input" style={styles.input}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    <button type="submit" className="auth-btn" style={styles.button}>
                                        GỬI YÊU CẦU
                                    </button>
                                </form>
                                <p style={styles.switchText}>
                                    Nhớ lại mật khẩu rồi? <Link to="/login" className="auth-link" style={styles.link}>Đăng nhập</Link>
                                </p>
                            </>
                        ) : (
                        /* --- GIAO DIỆN LOGIN / REGISTER --- */
                            <>
                                <h2 style={styles.title}>{view === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản'}</h2>
                                <p style={styles.subtitle}>
                                    {view === 'login' ? 'Vui lòng đăng nhập để tiếp tục.' : 'Tham gia cùng chúng tôi ngay hôm nay!'}
                                </p>

                                <form onSubmit={handleSubmit} style={styles.form}>
                                    {view === 'register' && (
                                        <input 
                                            type="text" placeholder="Họ và tên của bạn" required
                                            className="auth-input" style={styles.input}
                                            onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                                        />
                                    )}
                                    <input 
                                        type="email" placeholder="Địa chỉ Email" required
                                        className="auth-input" style={styles.input}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    <input 
                                        type="password" placeholder="Mật khẩu" required
                                        className="auth-input" style={styles.input}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                    
                                    {view === 'login' && (
                                        <Link to="/forgot-password" style={styles.forgotPassword}>Quên mật khẩu?</Link>
                                    )}

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
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    input: { padding: '15px', borderRadius: '10px', border: '1px solid #e1e1e1', fontSize: '15px', outline: 'none', transition: 'all 0.3s ease', backgroundColor: '#f9f9f9' },
    forgotPassword: { textAlign: 'right', fontSize: '13px', color: '#e67e22', cursor: 'pointer', marginTop: '-10px', fontWeight: '500', textDecoration: 'none' },
    button: { padding: '15px', borderRadius: '10px', border: 'none', background: '#e67e22', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.3)' },
    switchText: { marginTop: '30px', fontSize: '15px', color: '#666', textAlign: 'center' },
    link: { color: '#e67e22', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', textDecoration: 'none', marginLeft: '5px' }
};

export default Auth;