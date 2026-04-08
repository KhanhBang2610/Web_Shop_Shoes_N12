import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryManagement = () => {
  // 1. Khai báo tất cả State bên trong Component
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data.data);
    } catch {
      console.error("Lỗi thêm danh mục");
    }
  };

  // 2. Gọi API khi trang load
  useEffect(() => { 
    fetchCategories(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // 3. Hàm thêm danh mục
  const handleAdd = async () => {
    if (!newCategory.name) return alert("Vui lòng nhập tên danh mục");
    try {
      await axios.post('http://localhost:5000/api/categories', newCategory);
      setNewCategory({ name: '', description: '' }); // Xóa trắng ô input sau khi thêm
      fetchCategories(); // Load lại danh sách
    } catch {
      console.error("Lỗi thêm danh mục");
    }
  };

  // 4. Hàm xóa danh mục
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`);
        fetchCategories();
      } catch {
        alert("Không thể xóa danh mục này (có thể đang có sản phẩm thuộc danh mục này)");
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>📁 Quản lý danh mục thương hiệu</h2>
      
      {/* Form thêm mới */}
      <div style={{ marginBottom: '25px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h4 style={{ marginTop: 0, color: '#34495e', marginBottom: '15px' }}>Thêm thương hiệu mới</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            placeholder="Tên thương hiệu (VD: Nike, Adidas...)" 
            value={newCategory.name}
            onChange={e => setNewCategory({...newCategory, name: e.target.value})}
            style={{ padding: '12px', flex: 1, borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '15px' }}
          />
          <button 
            onClick={handleAdd} 
            style={{ padding: '10px 30px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}
          >
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bảng hiển thị */}
      <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #edf2f7' }}>
              <th style={{ padding: '15px', textAlign: 'left', width: '100px', color: '#7f8c8d' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#7f8c8d' }}>Tên thương hiệu</th>
              <th style={{ padding: '15px', textAlign: 'center', width: '150px', color: '#7f8c8d' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(cat => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f2f6', transition: '0.2s' }}>
                  <td style={{ padding: '15px', color: '#2c3e50' }}>#{cat.id}</td>
                  <td style={{ padding: '15px', fontWeight: '600', color: '#2d3436' }}>{cat.name}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      style={{ color: '#e74c3c', border: '1px solid #fab1a0', background: '#fff5f5', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#a4b0be' }}>Chưa có danh mục nào được tạo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;