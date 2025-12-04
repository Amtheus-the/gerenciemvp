/**
 * Serviço de despesas para React Native
 */

import api from './api';

export const listarDespesas = async () => {
  const response = await api.get('/despesas');
  return response;
};

export const criarDespesa = async (despesa) => {
  const response = await api.post('/despesas', despesa);
  return response;
};

export const atualizarDespesa = async (id, despesa) => {
  const response = await api.put(`/despesas/${id}`, despesa);
  return response;
};

export const deletarDespesa = async (id) => {
  const response = await api.delete(`/despesas/${id}`);
  return response;
};
