import axios from 'axios';
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.72:8000/api';
  } else if (Platform.OS === 'ios') {
    return 'http://192.168.1.72:8000/api';
  } else {
    return 'http://localhost:8000/api';
  }
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
  withCredentials: false,
});

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Registering user with:', API_BASE_URL);
      const response = await api.post('/register/', userData);
      if (response.data.user) {
        await saveUserData(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Make sure Django is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      console.log('Logging in with:', API_BASE_URL);
      const response = await api.post('/login/', credentials);
      if (response.data.user) {
        await saveUserData(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Make sure Django is running on ' + API_BASE_URL);
      }
      throw error;
    }
  },
  
  logout: async () => {
    const response = await api.post('/logout/');
    await clearUserData();
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/current-user/');
    if (response.data.user) {
      await saveUserData(response.data);
    }
    return response.data;
  },
};

// Helper functions for AsyncStorage
const saveUserData = async (data) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    if (data.profile) {
      await AsyncStorage.setItem('profile_data', JSON.stringify(data.profile));
    }
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

const clearUserData = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.multiRemove(['user_data', 'profile_data']);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const resumeAPI = {
  uploadAndAnalyze: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/upload-resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/cv-history/');
    return response.data;
  },
  
  getDetail: async (cvId) => {
    const response = await api.get(`/cv/${cvId}/`);
    return response.data;
  },
};

export default api;
