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
  Container,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import adminService from '../../services/adminService';

/**
 * Card de Estatística
 */
const StatCard = ({ title, value, icon: Icon, color }) => (
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
 * Componente Principal - Dashboard Admin SIMPLIFICADO
 */
const DashboardAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estatisticas, setEstatisticas] = useState({
    totalUsuarios: 0,
    usuariosAtivos: 0,
    receitaTotal: 0,
    crescimento: 0
  });

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
    carregarUsuarios();
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
  const dadosGraficoPizza = distribuicaoTipos.map((item, index) => {
    const cores = ['#00B389', '#007bff', '#ffc107'];
    const total = distribuicaoTipos.reduce((acc, curr) => acc + curr.total, 0);
    const percent = ((item.total / total) * 100).toFixed(1);
    
    return {
      name: item.tipo === 'PF' ? 'Pessoa Física' : item.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Híbrido',
      value: item.total,
      percent: parseFloat(percent),
    };
  });

  const coresGraficoPizza = ['#00B389', '#007bff', '#ffc107'];

  if (loading && !estatisticas) {
    return (
      <>
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{ ml: 0, mt: '50px' }}
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        sx={{
          flexGrow: 1,
          padding: '70px 30px 30px 30px',
          paddingLeft: { xs: '30px', md: '30px' },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {/* Cabeçalho */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Dashboard Administrativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe todos os usuários e atividades do sistema
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
                subtitle={`${estatisticas.usuariosAtivos} ativos nos últimos 30 dias`}
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
                subtitle={`${estatisticas.totalAnalises} análises realizadas`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Saldo Total"
                value={formatarMoeda(estatisticas.saldoTotal)}
                icon={AttachMoneyIcon}
                color={estatisticas.saldoTotal >= 0 ? '#00B389' : '#FF4873'}
                subtitle={`${formatarMoeda(estatisticas.faturamentoTotal)} em receitas`}
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
                  <Box sx={{ height: 300 }}>
                    {/* Aqui você pode implementar um gráfico de linha personalizado */}
                    <Typography variant="body2" color="text.secondary">
                      {graficoCrescimento.map((item) => `${item.mes}: ${item.total} usuários`).join(' | ')}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Dados insuficientes para exibir o gráfico
                  </Typography>
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
                {distribuicaoTipos.length > 0 ? (
                  <GraficoPizza data={dadosGraficoPizza} colors={coresGraficoPizza} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Sem dados disponíveis
                  </Typography>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Usuários do Sistema
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Buscar usuário..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: 250 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Ordenar por</InputLabel>
                      <Select
                        value={ordenar}
                        label="Ordenar por"
                        onChange={(e) => setOrdenar(e.target.value)}
                      >
                        <MenuItem value="createdAt">Data de Cadastro</MenuItem>
                        <MenuItem value="nome">Nome</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
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
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                {usuario.nome.charAt(0).toUpperCase()}
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
                          <TableCell>
                            <Chip
                              label={usuario.ativo ? 'Ativo' : 'Inativo'}
                              size="small"
                              color={usuario.ativo ? 'success' : 'default'}
                              icon={usuario.ativo ? <CheckCircleIcon /> : <BlockIcon />}
                            />
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
                      ))}
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
                  {atividades.map((atividade, index) => (
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
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

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
    </>
  );
};

export default DashboardAdmin;
