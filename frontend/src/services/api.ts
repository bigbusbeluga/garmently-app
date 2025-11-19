import axios from 'axios';import axios from 'axios';import axios from 'axios';



const API_BASE_URL = process.env.NODE_ENV === 'production' 

  ? (process.env.REACT_APP_API_URL || 'https://garmently-backend.vercel.app/api')

  : 'http://localhost:8000/api';// Get API base URL from environment variable or default to localhost// Base URL for Django backend



const api = axios.create({const API_BASE_URL = process.env.NODE_ENV === 'production' const API_BASE_URL = process.env.NODE_ENV === 'production' 

  baseURL: API_BASE_URL,

  headers: {  ? (process.env.REACT_APP_API_URL || 'https://garmently-backend.vercel.app/api')  ? process.env.REACT_APP_API_URL || 'https://garmently-backend.vercel.app/api'

    'Content-Type': 'application/json',

  },  : 'http://localhost:8000/api';  : 'http://localhost:8000/api';

});



export const apiService = {

  getGarments: async () => {const api = axios.create({// Create axios instance with default config

    const response = await api.get('/garments/');

    return response.data;  baseURL: API_BASE_URL,const api = axios.create({

  },

  headers: {  baseURL: API_BASE_URL,

  getGarment: async (id: number) => {

    const response = await api.get(`/garments/${id}/`);    'Content-Type': 'application/json',  timeout: 10000,

    return response.data;

  },  },  headers: {



  createGarment: async (data: FormData) => {});    'Content-Type': 'application/json',

    const response = await api.post('/garments/', data, {

      headers: {  },

        'Content-Type': 'multipart/form-data',

      },export const apiService = {});

    });

    return response.data;  // Garments

  },

  getGarments: async () => {// API functions

  updateGarment: async (id: number, data: FormData) => {

    const response = await api.put(`/garments/${id}/`, data, {    const response = await api.get('/garments/');export const apiService = {

      headers: {

        'Content-Type': 'multipart/form-data',    return response.data;  // Test connection to backend

      },

    });  },  testConnection: async () => {

    return response.data;

  },    try {



  deleteGarment: async (id: number) => {  getGarment: async (id: number) => {      const response = await api.get('/hello/');

    const response = await api.delete(`/garments/${id}/`);

    return response.data;    const response = await api.get(`/garments/${id}/`);      return response.data;

  },

    return response.data;    } catch (error) {

  getCategories: async () => {

    const response = await api.get('/categories/');  },      console.error('Error testing connection:', error);

    return response.data;

  },      throw error;

};

  createGarment: async (data: FormData) => {    }

export default api;

    const response = await api.post('/garments/', data, {  },

      headers: {

        'Content-Type': 'multipart/form-data',  // Get API status

      },  getStatus: async () => {

    });    try {

    return response.data;      const response = await api.get('/status/');

  },      return response.data;

    } catch (error) {

  updateGarment: async (id: number, data: FormData) => {      console.error('Error getting status:', error);

    const response = await api.put(`/garments/${id}/`, data, {      throw error;

      headers: {    }

        'Content-Type': 'multipart/form-data',  },

      },

    });  // Get all garments

    return response.data;  getGarments: async () => {

  },    try {

      const response = await api.get('/garments/');

  deleteGarment: async (id: number) => {      return response.data;

    const response = await api.delete(`/garments/${id}/`);    } catch (error) {

    return response.data;      console.error('Error fetching garments:', error);

  },      throw error;

    }

  // Categories  },

  getCategories: async () => {

    const response = await api.get('/categories/');  // Create new garment

    return response.data;  createGarment: async (garmentData: any) => {

  },    try {

};      const response = await api.post('/garments/', garmentData);

      return response.data;

export default api;    } catch (error) {

      console.error('Error creating garment:', error);
      throw error;
    }
  },
};

export default apiService;