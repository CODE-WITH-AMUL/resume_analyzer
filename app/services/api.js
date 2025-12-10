import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


// -------------------------------
// 🌐 Configure API URLs
// -------------------------------
const LOCAL_IP = '192.168.1.72'; // Replace with your PC's LAN IP
const PORT = 8000;

const getAccountUrl = () => `http://${LOCAL_IP}:${PORT}/api`;
const getCoreUrl = () => `http://${LOCAL_IP}:${PORT}`;

const API_ACCOUNT_URL = getAccountUrl();
const API_CORE_URL = getCoreUrl();

console.log('🌐 Account API URL:', API_ACCOUNT_URL);
console.log('🌐 Core API URL:', API_CORE_URL);

// -------------------------------
// 🔥 Axios Instance
// -------------------------------
const api = axios.create({
  baseURL: API_CORE_URL, // Default base for core APIs
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// -------------------------------
// ⚡ AUTH APIs (Register / Login / Logout / Current User)
// -------------------------------
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post(`${API_ACCOUNT_URL}/register/`, userData);
      if (response.data.user) await saveUserData(response.data.user);
      return response.data;
    } catch (error) {
      return handleError(error, 'Registration');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post(`${API_ACCOUNT_URL}/login/`, credentials);
      if (response.data.user) await saveUserData(response.data.user);
      return response.data;
    } catch (error) {
      return handleError(error, 'Login');
    }
  },

  logout: async () => {
    try {
      await api.post(`${API_ACCOUNT_URL}/logout/`);
      await clearUserData();
      return { message: 'Logged out successfully' };
    } catch (error) {
      return handleError(error, 'Logout');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get(`${API_ACCOUNT_URL}/current-user/`);
      if (response.data.user) await saveUserData(response.data.user);
      return response.data;
    } catch (error) {
      return handleError(error, 'Current User Fetch');
    }
  },
};

// -------------------------------
// 📄 RESUME APIs (Upload / History / Detail)
// -------------------------------
export const resumeAPI = {
  uploadAndAnalyze: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post(`${API_CORE_URL}/upload-resume/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress) {
            const percent = Math.round((event.loaded * 100) / event.total);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error) {
      return handleError(error, 'Resume Upload');
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get(`${API_CORE_URL}/cv-history/`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Resume History');
    }
  },

  getDetail: async (cvId) => {
    try {
      const response = await api.get(`${API_CORE_URL}/cv/${cvId}/`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Resume Detail');
    }
  },
};

// -------------------------------
// 🗂 AsyncStorage Helpers
// -------------------------------
const saveUserData = async (user) => {
  try {
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
  } catch (error) {
    console.error('AsyncStorage save error:', error);
  }
};

const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('user_data');
  } catch (error) {
    console.error('AsyncStorage clear error:', error);
  }
};

// -------------------------------
// ❌ Error Handler
// -------------------------------
const handleError = (error, type) => {
  console.error(`${type} Error:`, error);

  if (error.code === 'ECONNABORTED') throw new Error('Request timeout. Try again.');
  if (error.message === 'Network Error') throw new Error('Cannot connect to server: ' + API_CORE_URL);
  if (error.response?.data) return error.response.data;

  throw new Error('An unknown error occurred.');
};

export default api;
