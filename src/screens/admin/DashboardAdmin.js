/**
 * Página Dashboard Administrativo
 * Interface EXCLUSIVA para administradores
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Pagination,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import GraficoPizza from '../../components/GraficoPizza';

/**
 * Card de Estatística
 */
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: color + '20',
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: 40, color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Componente Principal - Dashboard Admin
 */
const DashboardAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estatisticas, setEstatisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState('');
  const [ordenar, setOrdenar] = useState('createdAt');
  const [ordem, setOrdem] = useState('DESC');
  const [atividades, setAtividades] = useState([]);
  const [graficoCrescimento, setGraficoCrescimento] = useState([]);
  const [distribuicaoTipos, setDistribuicaoTipos] = useState([]);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [detalhesUsuario, setDetalhesUsuario] = useState(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  /**
   * Carregar dados iniciais
   */
  useEffect(() => {
    carregarDados();
  }, []);

  /**
   * Recarregar usuários quando filtros mudarem
   */
  useEffect(() => {
    if (!loading) {
      carregarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, ordenar, ordem]);

  /**
   * Função para carregar todos os dados
   */
  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar dados em paralelo
      const [
        estatisticasData,
        usuariosData,
        atividadesData,
        crescimentoData,
        distribuicaoData,
      ] = await Promise.all([
        adminService.getEstatisticasGerais(),
        adminService.listarUsuarios({ page, search, ordenar, ordem }),
        adminService.getAtividadesRecentes(20),
        adminService.getGraficoCrescimento(12),
        adminService.getDistribuicaoTipos(),
      ]);

      setEstatisticas(estatisticasData);
      setUsuarios(usuariosData.usuarios);
      setTotalPaginas(usuariosData.totalPaginas);
      setAtividades(atividadesData);
      setGraficoCrescimento(crescimentoData);
      setDistribuicaoTipos(distribuicaoData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard administrativo');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carregar apenas lista de usuários
   */
  const carregarUsuarios = async () => {
    try {
      const usuariosData = await adminService.listarUsuarios({ page, search, ordenar, ordem });
      setUsuarios(usuariosData.usuarios);
      setTotalPaginas(usuariosData.totalPaginas);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    }
  };

  /**
   * Visualizar detalhes do usuário
   */
  const visualizarUsuario = async (usuario) => {
    try {
      setUsuarioSelecionado(usuario);
      setModalDetalhesOpen(true);
      setLoadingDetalhes(true);

      const detalhes = await adminService.getUsuarioDetalhes(usuario.id);
      setDetalhesUsuario(detalhes);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      setError('Erro ao carregar detalhes do usuário');
    } finally {
      setLoadingDetalhes(false);
    }
  };

  /**
   * Alternar status ativo/inativo do usuário
   */
  const toggleStatusUsuario = async (userId) => {
    try {
      await adminService.toggleStatusUsuario(userId);
      carregarUsuarios();
      if (detalhesUsuario && detalhesUsuario.usuario.id === userId) {
        setModalDetalhesOpen(false);
      }
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      setError('Erro ao alterar status do usuário');
    }
  };

  /**
   * Formatar valor monetário
   */
  const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Formatar data
   */
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Preparar dados para o gráfico de pizza
   */
  const dadosGraficoPizza = distribuicaoTipos.length > 0 ? distribuicaoTipos.map((item) => {
    const total = distribuicaoTipos.reduce((acc, curr) => acc + curr.total, 0);
    const percent = total > 0 ? ((item.total / total) * 100).toFixed(1) : 0;
    
    return {
      name: item.tipo === 'PF' ? 'Pessoa Física' : item.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Híbrido',
      value: item.total,
      percent: parseFloat(percent),
    };
  }) : [];

  const coresGraficoPizza = ['#00B389', '#007bff', '#ffc107'];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
          🏥 Gerêncie Odonto - Painel Administrativo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Olá, Administrador! Gerencie todos os usuários e visualize estatísticas do sistema.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total de Usuários"
              value={estatisticas.totalUsuarios}
              icon={PeopleIcon}
              color="#007bff"
              subtitle={`${estatisticas.usuariosAtivos} ativos`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Novos Usuários"
              value={estatisticas.novosUsuariosMes}
              icon={PersonAddIcon}
              color="#00B389"
              subtitle="Este mês"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total de Lançamentos"
              value={estatisticas.totalLancamentos}
              icon={AssignmentIcon}
              color="#ffc107"
              subtitle={`${estatisticas.totalAnalises} análises`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Saldo Total"
              value={formatarMoeda(estatisticas.saldoTotal)}
              icon={AttachMoneyIcon}
              color={estatisticas.saldoTotal >= 0 ? '#00B389' : '#FF4873'}
              subtitle={formatarMoeda(estatisticas.faturamentoTotal)}
            />
          </Grid>
        </Grid>
      )}

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Crescimento de Usuários (12 meses)
              </Typography>
              {graficoCrescimento.length > 0 ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {graficoCrescimento.map((item) => `${item.mes}: ${item.total}`).join(' | ')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dados insuficientes para exibir o gráfico
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Distribuição por Tipo
              </Typography>
              {dadosGraficoPizza.length > 0 ? (
                <GraficoPizza data={dadosGraficoPizza} colors={coresGraficoPizza} />
              ) : (
                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Sem dados disponíveis
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Usuários e Atividades */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Gerenciamento de Usuários
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Gerencie todos os usuários da plataforma
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Buscar por nome, email ou clínica..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 1, minWidth: 250 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                      value={ordenar}
                      label="Ordenar por"
                      onChange={(e) => setOrdenar(e.target.value)}
                    >
                      <MenuItem value="createdAt">Cadastro</MenuItem>
                      <MenuItem value="nome">Nome</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Ordem</InputLabel>
                    <Select
                      value={ordem}
                      label="Ordem"
                      onChange={(e) => setOrdem(e.target.value)}
                    >
                      <MenuItem value="ASC">ASC</MenuItem>
                      <MenuItem value="DESC">DESC</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Lançamentos</TableCell>
                      <TableCell align="right">Análises</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Cadastro</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            Nenhum usuário encontrado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      usuarios.map((usuario) => (
                        <TableRow key={usuario.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {usuario.nome?.charAt(0).toUpperCase() || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {usuario.nome}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {usuario.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={usuario.tipoPessoa}
                              size="small"
                              color={
                                usuario.tipoPessoa === 'PF'
                                  ? 'primary'
                                  : usuario.tipoPessoa === 'PJ'
                                  ? 'success'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            {(usuario.totalFaturamentos || 0) + (usuario.totalDespesas || 0)}
                          </TableCell>
                          <TableCell align="right">{usuario.totalAnalises || 0}</TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600,
                                color: (usuario.valorTotalFaturamento - usuario.valorTotalDespesas) >= 0 ? '#00B389' : '#FF4873'
                              }}
                            >
                              {formatarMoeda((usuario.valorTotalFaturamento || 0) - (usuario.valorTotalDespesas || 0))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={usuario.ativo ? 'Ativo' : 'Inativo'}
                              size="small"
                              color={usuario.ativo ? 'success' : 'default'}
                              icon={usuario.ativo ? <CheckCircleIcon /> : <BlockIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatarData(usuario.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalhes">
                              <IconButton size="small" onClick={() => visualizarUsuario(usuario)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={usuario.ativo ? 'Desativar' : 'Ativar'}>
                              <IconButton
                                size="small"
                                onClick={() => toggleStatusUsuario(usuario.id)}
                                color={usuario.ativo ? 'error' : 'success'}
                              >
                                {usuario.ativo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPaginas}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Atividades Recentes
              </Typography>
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {atividades.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    Nenhuma atividade recente
                  </Typography>
                ) : (
                  atividades.map((atividade, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                atividade.tipo === 'novo_usuario' ? '#00B389' : '#007bff',
                            }}
                          >
                            {atividade.tipo === 'novo_usuario' ? <PersonAddIcon /> : <AnalyticsIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={atividade.descricao}
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(atividade.data).toLocaleString('pt-BR')}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < atividades.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Detalhes do Usuário */}
      <Dialog
        open={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Usuário
          {usuarioSelecionado && (
            <Chip
              label={usuarioSelecionado.ativo ? 'Ativo' : 'Inativo'}
              size="small"
              color={usuarioSelecionado.ativo ? 'success' : 'default'}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetalhes ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : detalhesUsuario ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detalhesUsuario.usuario.nome}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detalhesUsuario.usuario.email}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Tipo de Pessoa
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {detalhesUsuario.usuario.tipoPessoa}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Data de Cadastro
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatarData(detalhesUsuario.usuario.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Estatísticas
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Faturamentos:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {detalhesUsuario.estatisticas.totalFaturamentos}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Despesas:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {detalhesUsuario.estatisticas.totalDespesas}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Análises:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {detalhesUsuario.estatisticas.totalAnalises}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Valor Total Faturamento:</Typography>
                      <Typography variant="body2" fontWeight={700} color="#00B389">
                        {formatarMoeda(detalhesUsuario.estatisticas.valorTotalFaturamento)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Valor Total Despesas:</Typography>
                      <Typography variant="body2" fontWeight={700} color="#FF4873">
                        {formatarMoeda(detalhesUsuario.estatisticas.valorTotalDespesas)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Saldo:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={detalhesUsuario.estatisticas.saldo >= 0 ? '#00B389' : '#FF4873'}
                      >
                        {formatarMoeda(detalhesUsuario.estatisticas.saldo)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>Erro ao carregar detalhes</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDetalhesOpen(false)}>Fechar</Button>
          {usuarioSelecionado && (
            <Button
              onClick={() => toggleStatusUsuario(usuarioSelecionado.id)}
              color={usuarioSelecionado.ativo ? 'error' : 'success'}
              variant="contained"
            >
              {usuarioSelecionado.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardAdmin;
