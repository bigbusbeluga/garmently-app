import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },

  // Garments
  getGarments: async () => {
    const response = await api.get('/garments/');
    return response.data;
  },

  getGarment: async (id) => {
    const response = await api.get(`/garments/${id}/`);
    return response.data;
  },

  createGarment: async (formData) => {
    const response = await api.post('/garments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateGarment: async (id, formData) => {
    const response = await api.put(`/garments/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteGarment: async (id) => {
    const response = await api.delete(`/garments/${id}/`);
    return response.data;
  },

  wearGarment: async (id) => {
    const response = await api.post(`/garments-api/${id}/wear/`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  // Outfits
  getOutfits: async () => {
    const response = await api.get('/outfits/');
    return response.data;
  },

  createOutfit: async (data) => {
    const response = await api.post('/outfits/', data);
    return response.data;
  },

  deleteOutfit: async (id) => {
    const response = await api.delete(`/outfits/${id}/`);
    return response.data;
  },

  // Status check
  checkStatus: async () => {
    const response = await api.get('/status/');
    return response.data;
  },
};

export default api;
