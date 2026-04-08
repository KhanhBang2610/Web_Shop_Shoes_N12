import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Thay port theo server của bạn

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getProfile = async () => {
    const response = await axios.get(`${API_URL}/user/profile`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

// Truyền FormData để upload ảnh
export const updateProfile = async (formData) => {
    const response = await axios.put(`${API_URL}/user/profile`, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const loginAdmin = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data.data;
};
