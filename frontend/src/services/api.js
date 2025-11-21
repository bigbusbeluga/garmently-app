import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const USE_MOCK_DATA = true; // Force demo mode - change to !process.env.REACT_APP_API_URL when backend is ready

// Mock data for demo
const mockGarments = [
  {
    id: 1,
    name: 'Blue Denim Jacket',
    category_name: 'Outerwear',
    color: 'Blue',
    size: 'M',
    image_url: 'https://via.placeholder.com/300x300/4299E1/FFFFFF?text=Denim+Jacket',
    status: 'clean',
    is_favorite: false,
    times_worn: 5,
    brand: 'Levi\'s'
  },
  {
    id: 2,
    name: 'White T-Shirt',
    category_name: 'Tops',
    color: 'White',
    size: 'M',
    image_url: 'https://via.placeholder.com/300x300/FFFFFF/333333?text=White+T-Shirt',
    status: 'clean',
    is_favorite: true,
    times_worn: 12,
    brand: 'H&M'
  }
];

const mockCategories = [
  { id: 1, name: 'Tops', icon: 'fa-shirt' },
  { id: 2, name: 'Bottoms', icon: 'fa-pants' },
  { id: 3, name: 'Outerwear', icon: 'fa-jacket' },
  { id: 4, name: 'Shoes', icon: 'fa-shoe' },
];

const mockOutfits = [];

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
    if (USE_MOCK_DATA) {
      return { user: { username: userData.username, email: userData.email }, token: 'mock-token-123' };
    }
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    if (USE_MOCK_DATA) {
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify({ username: credentials.username }));
      return { user: { username: credentials.username }, token: 'mock-token-123' };
    }
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  logout: async () => {
    if (USE_MOCK_DATA) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    }
    const response = await api.post('/auth/logout/');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  getCurrentUser: async () => {
    if (USE_MOCK_DATA) {
      return { username: 'demo_user', email: 'demo@example.com' };
    }
    const response = await api.get('/auth/user/');
    return response.data;
  },

  // Garments
  getGarments: async () => {
    if (USE_MOCK_DATA) {
      return mockGarments;
    }
    const response = await api.get('/garments/');
    return response.data;
  },

  getGarment: async (id) => {
    if (USE_MOCK_DATA) {
      return mockGarments.find(g => g.id === id);
    }
    const response = await api.get(`/garments/${id}/`);
    return response.data;
  },

  createGarment: async (formData) => {
    if (USE_MOCK_DATA) {
      const newGarment = {
        id: mockGarments.length + 1,
        name: formData.get('name'),
        category_name: 'Tops',
        color: formData.get('color'),
        size: formData.get('size'),
        status: 'clean',
        is_favorite: false,
        times_worn: 0,
      };
      mockGarments.push(newGarment);
      return newGarment;
    }
    const response = await api.post('/garments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateGarment: async (id, formData) => {
    if (USE_MOCK_DATA) {
      const index = mockGarments.findIndex(g => g.id === id);
      if (index !== -1) {
        mockGarments[index] = { ...mockGarments[index], ...Object.fromEntries(formData) };
        return mockGarments[index];
      }
    }
    const response = await api.put(`/garments/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteGarment: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockGarments.findIndex(g => g.id === id);
      if (index !== -1) mockGarments.splice(index, 1);
      return { success: true };
    }
    const response = await api.delete(`/garments/${id}/`);
    return response.data;
  },

  wearGarment: async (id) => {
    if (USE_MOCK_DATA) {
      const garment = mockGarments.find(g => g.id === id);
      if (garment) garment.times_worn++;
      return garment;
    }
    const response = await api.post(`/garments-api/${id}/wear/`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    if (USE_MOCK_DATA) {
      return mockCategories;
    }
    const response = await api.get('/categories/');
    return response.data;
  },

  // Outfits
  getOutfits: async () => {
    if (USE_MOCK_DATA) {
      return mockOutfits;
    }
    const response = await api.get('/outfits/');
    return response.data;
  },

  getOutfit: async (id) => {
    if (USE_MOCK_DATA) {
      return mockOutfits.find(o => o.id === id);
    }
    const response = await api.get(`/outfits/${id}/`);
    return response.data;
  },

  createOutfit: async (data) => {
    if (USE_MOCK_DATA) {
      const newOutfit = {
        id: mockOutfits.length + 1,
        name: data.name,
        garments: mockGarments.filter(g => data.garments.includes(g.id)),
        occasion: data.occasion,
        notes: data.notes,
        times_worn: 0,
        is_favorite: false,
      };
      mockOutfits.push(newOutfit);
      return newOutfit;
    }
    const response = await api.post('/outfits/', data);
    return response.data;
  },

  updateOutfit: async (id, data) => {
    if (USE_MOCK_DATA) {
      const index = mockOutfits.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOutfits[index] = { ...mockOutfits[index], ...data };
        return mockOutfits[index];
      }
    }
    const response = await api.patch(`/outfits/${id}/`, data);
    return response.data;
  },

  deleteOutfit: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockOutfits.findIndex(o => o.id === id);
      if (index !== -1) mockOutfits.splice(index, 1);
      return { success: true };
    }
    const response = await api.delete(`/outfits/${id}/`);
    return response.data;
  },

  // Status check
  checkStatus: async () => {
    if (USE_MOCK_DATA) {
      return { status: 'ok', mode: 'demo' };
    }
    const response = await api.get('/status/');
    return response.data;
  },
};

export default api;
