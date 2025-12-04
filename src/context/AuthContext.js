/**
 * Contexto de autenticação para React Native
 * Gerencia estado de autenticação do usuário
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Carrega dados do usuário ao iniciar
  useEffect(() => {
    loadStorageData();
  }, []);

  /**
   * Carrega dados do AsyncStorage
   */
  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser = await AsyncStorage.getItem('@user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza o login do usuário
   */
  const login = async (email, senha) => {
    try {
      const response = await loginService(email, senha);
      
      setToken(response.token);
      setUser(response.user);
      
      await AsyncStorage.setItem('@token', response.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  /**
   * Registra um novo usuário
   */
  const register = async (dadosUsuario) => {
    try {
      const response = await registerService(dadosUsuario);
      
      setToken(response.token);
      setUser(response.user);
      
      await AsyncStorage.setItem('@token', response.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.user));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao registrar' 
      };
    }
  };

  /**
   * Realiza o logout do usuário
   */
  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout,
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
