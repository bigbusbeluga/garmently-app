import axios from 'axios';

// IMPORTANT: Must use full absolute URL with https://
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = false; // Always use real API in production - set to true only for local demo

// Validate URL format
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  console.error('❌ API_BASE_URL must start with http:// or https://', API_BASE_URL);
}

// Debug: Log the configuration on startup
console.log('API Configuration:', {
  API_BASE_URL,
  USE_MOCK_DATA,
  env_value: process.env.REACT_APP_API_URL,
  node_env: process.env.NODE_ENV
});

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
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },

  login: async (credentials) => {
    if (USE_MOCK_DATA) {
      localStorage.setItem('token', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify({ username: credentials.username }));
      return { user: { username: credentials.username }, token: 'mock-token-123' };
    }
    console.log('Calling login API:', `${API_BASE_URL}/api/auth/login/`);
    console.log('With credentials:', { username: credentials.username });
    const response = await api.post('/api/auth/login/', credentials);
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
      return { 
        username: 'demo_user', 
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        bio: 'Fashion enthusiast',
        profile_picture: null
      };
    }
    const response = await api.get('/api/auth/user/');
    return response.data;
  },

  updateProfile: async (formData) => {
    if (USE_MOCK_DATA) {
      const updated = {};
      for (let [key, value] of formData.entries()) {
        updated[key] = value;
      }
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    }
    const response = await api.patch('/api/auth/user/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (passwordData) => {
    if (USE_MOCK_DATA) {
      return { message: 'Password changed successfully' };
    }
    const response = await api.post('/api/auth/change-password/', passwordData);
    return response.data;
  },

  // Garments
  getGarments: async () => {
    if (USE_MOCK_DATA) {
      // Load from localStorage if available
      const stored = localStorage.getItem('demo_garments');
      if (stored) {
        const parsed = JSON.parse(stored);
        mockGarments.length = 0;
        mockGarments.push(...parsed);
      }
      return mockGarments;
    }
    const response = await api.get('/api/garments-api/');
    return response.data;
  },

  getGarment: async (id) => {
    if (USE_MOCK_DATA) {
      return mockGarments.find(g => g.id === id);
    }
    const response = await api.get(`/api/garments-api/${id}/`);
    return response.data;
  },

  createGarment: async (formData) => {
    if (USE_MOCK_DATA) {
      // Convert image to base64 for storage
      const file = formData.get('image');
      let imageUrl = 'https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image';
      
      if (file) {
        try {
          const reader = new FileReader();
          imageUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
        } catch (err) {
          console.error('Error reading image:', err);
        }
      }
      
      const newGarment = {
        id: mockGarments.length + 1,
        name: formData.get('name'),
        category_name: formData.get('category') || 'Tops',
        color: formData.get('color'),
        size: formData.get('size'),
        brand: formData.get('brand') || '',
        image_url: imageUrl,
        status: 'clean',
        is_favorite: false,
        times_worn: 0,
      };
      mockGarments.push(newGarment);
      // Save to localStorage
      localStorage.setItem('demo_garments', JSON.stringify(mockGarments));
      return newGarment;
    }
    const response = await api.post('/api/garments-api/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateGarment: async (id, data) => {
    if (USE_MOCK_DATA) {
      const index = mockGarments.findIndex(g => g.id === id);
      if (index !== -1) {
        const updates = data instanceof FormData ? Object.fromEntries(data) : data;
        mockGarments[index] = { ...mockGarments[index], ...updates };
        // Save to localStorage
        localStorage.setItem('demo_garments', JSON.stringify(mockGarments));
        return mockGarments[index];
      }
    }
    // Check if data is FormData or plain object
    const isFormData = data instanceof FormData;
    const response = await api.patch(`/api/garments-api/${id}/`, data, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  deleteGarment: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockGarments.findIndex(g => g.id === id);
      if (index !== -1) mockGarments.splice(index, 1);
      // Save to localStorage
      localStorage.setItem('demo_garments', JSON.stringify(mockGarments));
      return { success: true };
    }
    const response = await api.delete(`/api/garments-api/${id}/`);
    return response.data;
  },

  wearGarment: async (id) => {
    if (USE_MOCK_DATA) {
      const garment = mockGarments.find(g => g.id === id);
      if (garment) {
        garment.times_worn++;
        // Save to localStorage
        localStorage.setItem('demo_garments', JSON.stringify(mockGarments));
      }
      return garment;
    }
    const response = await api.post(`/api/garments-api/${id}/wear/`);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    if (USE_MOCK_DATA) {
      return mockCategories;
    }
    try {
      console.log('Fetching categories from:', `${API_BASE_URL}/api/categories/`);
      const response = await api.get('/api/categories/');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      // Return empty array as fallback so UI doesn't break
      return [];
    }
  },

  // Outfits
  getOutfits: async () => {
    if (USE_MOCK_DATA) {
      // Load from localStorage if available
      const stored = localStorage.getItem('demo_outfits');
      if (stored) {
        const parsed = JSON.parse(stored);
        mockOutfits.length = 0;
        mockOutfits.push(...parsed);
      }
      return mockOutfits;
    }
    const response = await api.get('/api/outfits/');
    return response.data;
  },

  getOutfit: async (id) => {
    if (USE_MOCK_DATA) {
      return mockOutfits.find(o => o.id === id);
    }
    const response = await api.get(`/api/outfits/${id}/`);
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
      // Save to localStorage
      localStorage.setItem('demo_outfits', JSON.stringify(mockOutfits));
      return newOutfit;
    }
    const response = await api.post('/api/outfits/', data);
    return response.data;
  },

  updateOutfit: async (id, data) => {
    if (USE_MOCK_DATA) {
      const index = mockOutfits.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOutfits[index] = { ...mockOutfits[index], ...data };
        // Save to localStorage
        localStorage.setItem('demo_outfits', JSON.stringify(mockOutfits));
        return mockOutfits[index];
      }
    }
    const response = await api.patch(`/api/outfits/${id}/`, data);
    return response.data;
  },

  deleteOutfit: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockOutfits.findIndex(o => o.id === id);
      if (index !== -1) mockOutfits.splice(index, 1);
      // Save to localStorage
      localStorage.setItem('demo_outfits', JSON.stringify(mockOutfits));
      return { success: true };
    }
    const response = await api.delete(`/api/outfits/${id}/`);
    return response.data;
  },

  // Status check
  checkStatus: async () => {
    if (USE_MOCK_DATA) {
      return { status: 'ok', mode: 'demo' };
    }
    const response = await api.get('/api/status/');
    return response.data;
  },

  // AI Outfit Recommendations
  getAIOutfitRecommendations: async (theme, weather = 'moderate') => {
    if (USE_MOCK_DATA) {
      // Mock AI recommendations
      return {
        outfits: [
          {
            name: `${theme} Look 1`,
            garment_ids: [1, 2],
            reasoning: `This combination is perfect for ${theme} with a comfortable yet stylish vibe`,
            style_tip: 'Add a statement accessory to personalize this look!'
          },
          {
            name: `${theme} Look 2`,
            garment_ids: [2, 3],
            reasoning: `A versatile outfit that works great for ${theme}`,
            style_tip: 'Layer with a jacket for cooler weather'
          }
        ]
      };
    }
    const response = await api.post('/api/ai/outfit-recommendations/', { theme, weather });
    return response.data;
  },
};

export default api;
