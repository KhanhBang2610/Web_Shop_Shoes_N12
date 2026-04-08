import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  
  const [currentProduct, setCurrentProduct] = useState({ 
    id: null, name: '', price: '', description: '', category_id: '' 
  });
  const [isEdit, setIsEdit] = useState(false);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data.data))
      .catch(error => console.error("Lỗi lấy danh sách sản phẩm:", error));
  };

  const fetchCategories = () => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data.data))
      .catch(error => console.error("Lỗi lấy danh mục:", error));
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories(); 
  }, []);

  const handleOpenAdd = () => {
    setCurrentProduct({ id: null, name: '', price: '', description: '', category_id: '' });
    setFile(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFile(null);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', currentProduct.name);
    formData.append('price', currentProduct.price);
    formData.append('description', currentProduct.description);
    formData.append('category_id', currentProduct.category_id);
    if (file) formData.append('image', file);

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/products/${currentProduct.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/products', formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      alert("Lỗi thao tác!");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header trang con */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>👟 Quản lý kho giày</h2>
        <button onClick={handleOpenAdd} style={{ padding: '10px 20px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Thêm sản phẩm mới
        </button>
      </div>

      {/* Bảng dữ liệu - Sẽ hiển thị bên phải Sidebar của AdminLayout */}
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Ảnh</th>
              <th>Tên giày</th>
              <th>Giá bán</th>
              <th>Danh mục</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  <img 
                    src={p.image_url ? `http://localhost:5000${p.image_url}` : 'https://via.placeholder.com/50'} 
                    width="60" height="60" style={{ objectFit: 'cover', borderRadius: '5px' }} alt="" 
                  />
                </td>
                <td style={{ fontWeight: '500' }}>{p.name}</td>
                <td style={{ color: '#e67e22', fontWeight: 'bold' }}>{Number(p.price).toLocaleString()}đ</td>
                <td>{p.category_name || 'Chưa phân loại'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => handleOpenEdit(p)} style={{ marginRight: '10px', color: '#3498db', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sửa</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Giữ nguyên logic cũ */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{isEdit ? 'Cập nhật sản phẩm' : 'Thêm giày mới'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                placeholder="Tên sản phẩm"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                value={currentProduct.name} 
                onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required 
              />
              <select 
                value={currentProduct.category_id || ""} 
                onChange={e => setCurrentProduct({...currentProduct, category_id: e.target.value})}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input 
                type="number" placeholder="Giá bán"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                value={currentProduct.price} 
                onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required 
              />
              <textarea 
                placeholder="Mô tả"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', height: '80px' }}
                value={currentProduct.description} 
                onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} 
              />
              <input type="file" onChange={e => setFile(e.target.files[0])} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2ecc71', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Lưu</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#95a5a6', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
