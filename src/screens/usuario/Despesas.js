/**
 * Página de Despesas
 * Gerencia despesas e custos da clínica
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { listarDespesas, criarDespesa, atualizarDespesa, deletarDespesa } from '../../services/despesasService';
import planoContasService from '../../services/planoContasService';

/**
 * Página de Despesas
 */
const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '', // Armazena o ID (ou Nome) da categoria selecionada
    tipo: 'variavel',
    observacoes: '',
  });

  // Categorias dinâmicas
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);

  // Carrega dados ao montar
  useEffect(() => {
    carregarDados();
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const categorias = await planoContasService.listar();
      console.log('📦 Categorias recebidas:', categorias);
      // Assumindo que o endpoint retorna [{ id: 1, nome: 'Aluguel' }, ...]
      setCategoriasDespesas(categorias || []);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setCategoriasDespesas([]);
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await listarDespesas();
      console.log('📊 Despesas:', response);
      setDespesas(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar despesas:', err);
      setError('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNovo = () => {
    setModoEdicao(false);
    setItemEdicao(null);
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      tipo: 'variavel',
      observacoes: '',
    });
    setOpenModal(true);
  };

  const abrirModalEdicao = (item) => {
    setModoEdicao(true);
    setItemEdicao(item);
    // Tenta pré-selecionar a categoria usando o nome (ou ID se disponível)
    const categoriaParaForm = categoriasDespesas.find(cat => cat.nome === item.categoria)?.id || item.categoria || '';
    
    setFormData({
      descricao: item.descricao || '',
      valor: item.valor || '',
      data: item.data || '',
      categoria: categoriaParaForm,
      tipo: item.tipo || 'variavel',
      observacoes: item.observacoes || '',
    });
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      // Validação básica (Melhoria sugerida na análise)
      const valorNumerico = parseFloat(formData.valor);
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        throw new Error('O valor da despesa deve ser um número positivo.');
      }

      // Buscar o objeto da categoria selecionada (agora usando o valor que é o ID ou Nome)
      const categoriaObj = categoriasDespesas.find(cat => (cat.id || cat.nome) === formData.categoria);
      
      const dados = {
        descricao: formData.descricao,
        valor: valorNumerico,
        data: formData.data,
        // Envia o nome da categoria para o serviço de despesas
        categoria: categoriaObj?.nome || formData.categoria, 
        tipo: formData.tipo,
        observacoes: formData.observacoes
      };

      if (modoEdicao) {
        await atualizarDespesa(itemEdicao.id, dados);
        setSuccess('Despesa atualizada com sucesso!');
      } else {
        await criarDespesa(dados);
        setSuccess('Despesa criada com sucesso!');
      }

      fecharModal();
      carregarDados();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      // Se for o erro de validação (throw), mostra a mensagem
      const errorMessage = err.message || err.response?.data?.message || 'Erro ao salvar despesa';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      setLoading(true);
      await deletarDespesa(id);
      setSuccess('Despesa excluída com sucesso!');
      carregarDados();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setError('Erro ao excluir despesa');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    // Adiciona o 'T00:00:00' para garantir que o fuso horário não cause problemas na formatação de datas puras (YYYY-MM-DD)
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Calcular totais
  const totalDespesas = despesas.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
  const totalFixas = despesas.filter(d => d.tipo === 'fixa').reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
  const totalVariaveis = despesas.filter(d => d.tipo === 'variavel').reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          🧾 Despesas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirModalNovo}
        >
          Nova Despesa
        </Button>
      </Box>

      {/* Alertas */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ReceiptIcon color="error" />
                <Typography variant="h6">Total Geral</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatarMoeda(totalDespesas)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {despesas.length} lançamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingDownIcon color="primary" />
                <Typography variant="h6">Despesas Fixas</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {formatarMoeda(totalFixas)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {despesas.filter(d => d.tipo === 'fixa').length} lançamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingDownIcon color="warning" />
                <Typography variant="h6">Despesas Variáveis</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatarMoeda(totalVariaveis)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {despesas.filter(d => d.tipo === 'variavel').length} lançamentos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Despesas */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : despesas.length === 0 ? (
          <Box textAlign="center" p={5}>
            <Typography color="textSecondary" gutterBottom>
              Nenhuma despesa cadastrada ainda.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={abrirModalNovo}
            >
              Adicionar primeira despesa
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell>{formatarData(despesa.data)}</TableCell>
                    <TableCell>{despesa.descricao}</TableCell>
                    <TableCell>{despesa.categoria}</TableCell>
                    <TableCell>
                      <Chip 
                        label={despesa.tipo} 
                        size="small" 
                        // Alterado para 'warning' ou 'secondary' conforme sugestão
                        color={despesa.tipo === 'fixa' ? 'primary' : 'warning'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error.main" fontWeight="bold">
                        {formatarMoeda(despesa.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => abrirModalEdicao(despesa)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletar(despesa.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal de Criar/Editar */}
      <Dialog open={openModal} onClose={fecharModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {modoEdicao ? 'Editar' : 'Nova'} Despesa
            </Typography>
            <IconButton onClick={fecharModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Descrição"
                required
                fullWidth
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />

              <TextField
                label="Valor"
                required
                fullWidth
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />

              <TextField
                label="Data"
                required
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />

              {/* Ajuste de Seleção de Categoria (Usa ID ou Nome como valor) */}
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoria}
                  label="Categoria"
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {categoriasDespesas.length === 0 ? (
                    <MenuItem value="" disabled>Nenhuma categoria encontrada</MenuItem>
                  ) : (
                    categoriasDespesas.map((cat) => (
                      <MenuItem 
                        // Usa o ID como valor se existir, senão usa o nome (mantendo a compatibilidade)
                        key={cat.id || cat.nome || cat} 
                        value={cat.id || cat.nome || cat}
                      >
                        {cat.nome || cat}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {/* Fim do Ajuste */}

              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo"
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <MenuItem value="fixa">Fixa</MenuItem>
                  <MenuItem value="variavel">Variável</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={fecharModal}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Despesas;