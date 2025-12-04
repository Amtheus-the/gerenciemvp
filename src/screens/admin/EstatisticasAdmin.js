/**
 * Página de Estatísticas e Análises - Admin
 * Estatísticas detalhadas e análises do sistema
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import GraficoPizza from '../../components/GraficoPizza';
import adminService from '../../services/adminService';
import { useTheme } from '../../context/ThemeContext';

/**
 * Card de Estatística
 */
const StatCard = ({ title, value, icon: Icon, color = '#007bff', trend, trendValue }) => {
  return (
    <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color, my: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon
                  sx={{
                    fontSize: 16,
                    color: trend === 'up' ? '#00B389' : '#FF4873',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? '#00B389' : '#FF4873',
                    fontWeight: 600,
                  }}
                >
                  {trendValue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs mês anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color + '20',
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Componente Principal - Estatísticas Admin
 */
const EstatisticasAdmin = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dados
  const [estatisticas, setEstatisticas] = useState(null);
  const [graficoCrescimento, setGraficoCrescimento] = useState([]);
  const [distribuicaoTipos, setDistribuicaoTipos] = useState([]);
  const [periodo, setPeriodo] = useState('12');

  /**
   * Carregar dados
   */
  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');

      const [estatisticasData, crescimentoData, distribuicaoData] = await Promise.all([
        adminService.getEstatisticasGerais(),
        adminService.getGraficoCrescimento(periodo),
        adminService.getDistribuicaoTipos(),
      ]);

      setEstatisticas(estatisticasData);
      setGraficoCrescimento(crescimentoData);
      setDistribuicaoTipos(distribuicaoData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
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
   * Preparar dados para o gráfico de pizza
   */
  const dadosGraficoPizza = distribuicaoTipos.map((item) => {
    const total = distribuicaoTipos.reduce((acc, curr) => acc + curr.total, 0);
    const percent = ((item.total / total) * 100).toFixed(1);

    return {
      name:
        item.tipo === 'PF'
          ? 'Pessoa Física'
          : item.tipo === 'PJ'
          ? 'Pessoa Jurídica'
          : 'Híbrido',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Estatísticas e Análises
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Métricas detalhadas do sistema
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodo}
              label="Período"
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <MenuItem value="3">Últimos 3 meses</MenuItem>
              <MenuItem value="6">Últimos 6 meses</MenuItem>
              <MenuItem value="12">Últimos 12 meses</MenuItem>
              <MenuItem value="24">Últimos 24 meses</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Cards de Estatísticas Principais */}
        {estatisticas && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total de Usuários"
                  value={estatisticas.totalUsuarios}
                  icon={PeopleIcon}
                  color="#007bff"
                  trend="up"
                  trendValue="+12%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Usuários Ativos"
                  value={estatisticas.usuariosAtivos}
                  icon={TrendingUpIcon}
                  color="#00B389"
                  trend="up"
                  trendValue="+8%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Lançamentos"
                  value={estatisticas.totalLancamentos}
                  icon={AnalyticsIcon}
                  color="#ffc107"
                  trend="up"
                  trendValue="+25%"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Faturamento Total"
                  value={formatarMoeda(estatisticas.faturamentoTotal)}
                  icon={AttachMoneyIcon}
                  color="#00B389"
                  trend="up"
                  trendValue="+15%"
                />
              </Grid>
            </Grid>

            {/* Gráficos e Tabelas */}
            <Grid container spacing={3}>
              {/* Gráfico de Crescimento */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Crescimento de Usuários
                    </Typography>
                    {graficoCrescimento.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Mês</TableCell>
                              <TableCell align="right">Novos Usuários</TableCell>
                              <TableCell align="right">Total Acumulado</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {graficoCrescimento.map((item, index) => {
                              const totalAcumulado = graficoCrescimento
                                .slice(0, index + 1)
                                .reduce((acc, curr) => acc + curr.total, 0);
                              return (
                                <TableRow key={index}>
                                  <TableCell>{item.mes}</TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={item.total}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={600}>
                                      {totalAcumulado}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Dados insuficientes para exibir o gráfico
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Distribuição por Tipo */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Distribuição por Tipo
                    </Typography>
                    {distribuicaoTipos.length > 0 ? (
                      <>
                        <GraficoPizza data={dadosGraficoPizza} colors={coresGraficoPizza} />
                        <Box sx={{ mt: 2 }}>
                          {dadosGraficoPizza.map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: coresGraficoPizza[index],
                                  }}
                                />
                                <Typography variant="body2">{item.name}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={600}>
                                {item.value} ({item.percent}%)
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sem dados disponíveis
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Estatísticas Financeiras */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Resumo Financeiro Consolidado
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, backgroundColor: '#00B38920', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Faturamento Total
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00B389' }}>
                            {formatarMoeda(estatisticas.faturamentoTotal)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, backgroundColor: '#FF487320', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Despesas Totais
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF4873' }}>
                            {formatarMoeda(estatisticas.despesasTotal)}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor:
                              estatisticas.saldoTotal >= 0 ? '#00B38920' : '#FF487320',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Saldo Total
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: estatisticas.saldoTotal >= 0 ? '#00B389' : '#FF4873',
                            }}
                          >
                            {formatarMoeda(estatisticas.saldoTotal)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </>
  );
};

export default EstatisticasAdmin;
