import api from './api';


const listar = async () => {
  const res = await api.get('/plano-contas');
  // Se vier array direto, retorna; se vier em data, retorna data
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return res.data || res;
};

const criar = async (dados) => {
  const res = await api.post('/plano-contas', dados);
  return res.data;
};

const atualizar = async (id, dados) => {
  const res = await api.put(`/plano-contas/${id}`, dados);
  return res.data;
};

const deletar = async (id) => {
  const res = await api.delete(`/plano-contas/${id}`);
  return res.data;
};

export default {
  listar,
  criar,
  atualizar,
  deletar,
};
