/**
 * Cliente Axios configurado para React Native
 * Centraliza as configurações de requisições HTTP
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure a URL base da API
const API_URL = 'https://gerenciemvp-c8255fa85e28.herokuapp.com/'; // Heroku backend

// Cria instância do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // Se o erro for 401, remove token e dados do usuário
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
    }
    
    return Promise.reject(error);
  }
);

export default api;
