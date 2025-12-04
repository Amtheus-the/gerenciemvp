/**
 * Serviço de autenticação para React Native
 */

import api from './api';

/**
 * Realiza o login do usuário
 */
export const login = async (email, senha) => {
  const response = await api.post('/api/auth/login', { email, senha });
  return response;
};

/**
 * Registra um novo usuário
 */
export const register = async (dadosUsuario) => {
  const response = await api.post('/api/auth/register', dadosUsuario);
  return response;
};

/**
 * Busca dados do usuário autenticado
 */
export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response;
};
