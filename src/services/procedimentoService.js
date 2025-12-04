import api from './api';

const listar = async () => {
  const res = await api.get('/procedimentos');
  return Array.isArray(res.data) ? res.data : res.data || [];
};

export default {
  listar,
};
