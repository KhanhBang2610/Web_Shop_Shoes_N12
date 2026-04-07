import React, { useState } from 'react';
import { loginAdmin } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAdmin({ email, password });

      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        alert('Chào sếp!');
        navigate('/admin/dashboard');
      } else {
        alert('Đăng nhập thành công!');
        navigate('/');
      }

    } catch (err) {
      console.error(err);
      alert('Đăng nhập thất bại!');
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
  );
};

export default LoginPage;