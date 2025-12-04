/**
 * Página de Gestão de Usuários - Admin
 * Listagem completa e gerenciamento detalhado de usuários
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import adminService from '../../services/adminService';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente Principal - Usuários Admin
 */
const UsuariosAdmin = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dados
  const [usuarios, setUsuarios] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Paginação e filtros
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState('');
  const [ordenar, setOrdenar] = useState('createdAt');
  const [ordem, setOrdem] = useState('DESC');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  // Modal de detalhes do usuário
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [detalhesUsuario, setDetalhesUsuario] = useState(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  /**
   * Carregar usuários
   */
  useEffect(() => {
    carregarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, ordenar, ordem, tabValue]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      const usuariosData = await adminService.listarUsuarios({
        page,
        search,
        ordenar,
        ordem,
      });

      setUsuarios(usuariosData.usuarios);
      setTotalPaginas(usuariosData.totalPaginas);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
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
   * Filtrar usuários por tab
   */
  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (tabValue === 0) return true; // Todos
    if (tabValue === 1) return usuario.ativo; // Ativos
    if (tabValue === 2) return !usuario.ativo; // Inativos
    return true;
  });

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Gerenciamento de Usuários
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie todos os usuários da plataforma
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => alert('Exportar será implementado')}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => alert('Criar usuário será implementado')}
            >
              Novo Usuário
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Card Principal */}
        <Card>
          <CardContent>
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab
                label={
                  <Badge badgeContent={usuarios.length} color="primary">
                    <span style={{ marginRight: 8 }}>Todos</span>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={usuarios.filter((u) => u.ativo).length}
                    color="success"
                  >
                    <span style={{ marginRight: 8 }}>Ativos</span>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    badgeContent={usuarios.filter((u) => !u.ativo).length}
                    color="error"
                  >
                    <span style={{ marginRight: 8 }}>Inativos</span>
                  </Badge>
                }
              />
            </Tabs>

            {/* Filtros e Busca */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
                sx={{ flexGrow: 1, minWidth: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={ordenar}
                  label="Ordenar por"
                  onChange={(e) => setOrdenar(e.target.value)}
                >
                  <MenuItem value="createdAt">Data de Cadastro</MenuItem>
                  <MenuItem value="nome">Nome</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="updatedAt">Última Atualização</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Ordem</InputLabel>
                <Select
                  value={ordem}
                  label="Ordem"
                  onChange={(e) => setOrdem(e.target.value)}
                >
                  <MenuItem value="DESC">Decrescente</MenuItem>
                  <MenuItem value="ASC">Crescente</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tabela de Usuários */}
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                      {usuariosFiltrados.map((usuario) => (
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
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color:
                                  (usuario.valorTotalFaturamento || 0) -
                                    (usuario.valorTotalDespesas || 0) >=
                                  0
                                    ? '#00B389'
                                    : '#FF4873',
                              }}
                            >
                              {formatarMoeda(
                                (usuario.valorTotalFaturamento || 0) -
                                  (usuario.valorTotalDespesas || 0)
                              )}
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
                                {usuario.ativo ? (
                                  <BlockIcon fontSize="small" />
                                ) : (
                                  <CheckCircleIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPaginas}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
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

export default UsuariosAdmin;
