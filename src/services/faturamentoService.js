/**
 * Serviço de faturamento para React Native
 */

import api from './api';

export const listarFaturamento = async () => {
  const response = await api.get('/faturamento');
  return response;
};

export const criarFaturamento = async (faturamento) => {
  const response = await api.post('/faturamento', faturamento);
  return response;
};

export const atualizarFaturamento = async (id, faturamento) => {
  const response = await api.put(`/faturamento/${id}`, faturamento);
  return response;
};

export const deletarFaturamento = async (id) => {
  const response = await api.delete(`/faturamento/${id}`);
  return response;
};
