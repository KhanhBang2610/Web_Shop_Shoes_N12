import React, { useState } from 'react';
import { loginAdmin } from '../../api/authApi';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import thêm axios để gọi API Google

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // 1. Hàm xử lý đăng nhập bằng Email/Password bình thường
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAdmin({ email, password });

      if (data?.user?.role === 'admin') {
        localStorage.setItem('token', data.token);
        // Lưu thêm thông tin user để hiển thị trên Header nếu cần
        localStorage.setItem('user', JSON.stringify(data.user)); 
        alert('Chào sếp! Đang vào trang quản trị...');
        navigate('/admin/dashboard'); 
      } else {
        alert('Bạn không có quyền truy cập Admin!');
      }
    } catch (error) {
      console.error(error);
      alert('Đăng nhập thất bại!');
    }
  };

  // 2. Hàm xử lý khi đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Gửi token của Google xuống Backend để xác thực
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        credential: credentialResponse.credential,
      });

      if (res.data.success) {
        // Lưu thông tin vào localStorage
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        if (res.data.data.token) {
          localStorage.setItem('token', res.data.data.token);
        }

        // Kiểm tra quyền (Role) để chuyển hướng cho đúng
        if (res.data.data.user.role === 'admin') {
          alert('Chào sếp! Đang vào trang quản trị...');
          navigate('/admin/dashboard');
        } else {
          alert('Đăng nhập Google thành công!');
          navigate('/'); // Chuyển về trang chủ cho khách hàng
        }
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Google từ Server:", error);
      alert(error.response?.data?.message || 'Đăng nhập Google thất bại!');
    }
  };

  return (
    // Bỏ thẻ <form> bao bên ngoài toàn bộ, vì nút Google không dùng chung submit với form email/mật khẩu
    <div>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    
      {/* 3. NÚT ĐĂNG NHẬP GOOGLE */}
      <div style={{ maxWidth: '300px', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log('Đăng nhập Google thất bại');
            alert('Có lỗi xảy ra khi kết nối với Google!');
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;