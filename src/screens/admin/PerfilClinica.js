/**
 * Página de Perfil da Clínica
 * Visualização completa dos dados consolidados da clínica
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import clinicaService from '../../services/clinicaService';

// Componente de Card de Estatística
const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const PerfilClinica = () => {
  const { clinicaId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabAtual, setTabAtual] = useState(0);
  const [dados, setDados] = useState(null);

  /**
   * Carregar dados da clínica
   */
  useEffect(() => {
    carregarDados();
  }, [clinicaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clinicaService.getPerfilCompletoClinica(clinicaId);
      setDados(response);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da clínica');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleVoltar = () => {
    navigate('/admin/operacional');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVoltar} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  if (!dados || !dados.clinica) {
    return (
      <Box m={3}>
        <Alert severity="warning">Clínica não encontrada</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleVoltar} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  const { clinica, faturamentos, despesas, documentos, estatisticas } = dados;

  return (
    <Box>
      {/* Cabeçalho */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleVoltar}
          sx={{ mb: 2 }}
        >
          Voltar para Operacional
        </Button>

        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            <BusinessIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {clinica.nome}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {clinica.tipoPessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'} - {clinica.cpf || clinica.cnpj}
            </Typography>
            <Chip
              label={clinica.ativo ? 'Ativa' : 'Inativa'}
              color={clinica.ativo ? 'success' : 'error'}
              size="small"
              sx={{ mt: 1 }}
            />
            <Chip
              label={`Plano: ${clinica.plano}`}
              color="primary"
              size="small"
              sx={{ mt: 1, ml: 1 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Faturamento"
            value={formatarMoeda(estatisticas.totalFaturamento)}
            icon={TrendingUpIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Despesas"
            value={formatarMoeda(estatisticas.totalDespesas)}
            icon={TrendingDownIcon}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo"
            value={formatarMoeda(estatisticas.saldo)}
            icon={AttachMoneyIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários"
            value={estatisticas.numeroUsuarios}
            icon={PeopleIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabAtual}
          onChange={(e, newValue) => setTabAtual(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Informações" />
          <Tab label={`Usuários (${estatisticas.numeroUsuarios})`} />
          <Tab label={`Faturamentos (${estatisticas.numeroFaturamentos})`} />
          <Tab label={`Despesas (${estatisticas.numeroDespesas})`} />
          <Tab label={`Documentos (${estatisticas.numeroDocumentos})`} />
        </Tabs>

        <CardContent>
          {/* Tab 0: Informações */}
          {tabAtual === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Dados da Clínica
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Nome"
                      secondary={clinica.nome}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <DescriptionIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={clinica.tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}
                      secondary={clinica.cnpj || clinica.cpf || 'Não informado'}
                    />
                  </ListItem>
                  {clinica.email && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <EmailIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Email"
                        secondary={clinica.email}
                      />
                    </ListItem>
                  )}
                  {clinica.telefone && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PhoneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Telefone"
                        secondary={clinica.telefone}
                      />
                    </ListItem>
                  )}
                  {clinica.endereco && (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <LocationOnIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Endereço"
                        secondary={`${clinica.endereco}, ${clinica.numero || 'S/N'} - ${clinica.bairro}, ${clinica.cidade}/${clinica.estado}`}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Estatísticas Financeiras
                </Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Faturamento:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {formatarMoeda(estatisticas.totalFaturamento)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total Despesas:</Typography>
                    <Typography fontWeight="bold" color="error.main">
                      {formatarMoeda(estatisticas.totalDespesas)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">Saldo:</Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={estatisticas.saldo >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatarMoeda(estatisticas.saldo)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Impostos Estimados (6,5%):</Typography>
                    <Typography fontWeight="bold">
                      {formatarMoeda(estatisticas.impostosEstimados)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Usuários */}
          {tabAtual === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Usuários da Clínica
              </Typography>
              {clinica.usuarios && clinica.usuarios.length > 0 ? (
                <List>
                  {clinica.usuarios.map((usuario) => (
                    <ListItem key={usuario.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={usuario.nome}
                        secondary={
                          <>
                            {usuario.email}
                            {usuario.profissao && ` • ${usuario.profissao}`}
                            {!usuario.ativo && ' • Inativo'}
                          </>
                        }
                      />
                      <Chip
                        label={usuario.ativo ? 'Ativo' : 'Inativo'}
                        color={usuario.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">Nenhum usuário cadastrado</Alert>
              )}
            </Box>
          )}

          {/* Tab 2: Faturamentos */}
          {tabAtual === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Faturamentos
              </Typography>
              {faturamentos && faturamentos.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Lançado por</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faturamentos.map((fat) => (
                        <TableRow key={fat.id}>
                          <TableCell>{formatarData(fat.data)}</TableCell>
                          <TableCell>{fat.descricao}</TableCell>
                          <TableCell>{fat.paciente}</TableCell>
                          <TableCell>{fat.usuario?.nome || '-'}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            {formatarMoeda(fat.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Nenhum faturamento registrado</Alert>
              )}
            </Box>
          )}

          {/* Tab 3: Despesas */}
          {tabAtual === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Despesas
              </Typography>
              {despesas && despesas.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Lançado por</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {despesas.map((desp) => (
                        <TableRow key={desp.id}>
                          <TableCell>{formatarData(desp.data)}</TableCell>
                          <TableCell>{desp.descricao}</TableCell>
                          <TableCell>
                            <Chip label={desp.categoria} size="small" />
                          </TableCell>
                          <TableCell>{desp.usuario?.nome || '-'}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            {formatarMoeda(desp.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Nenhuma despesa registrada</Alert>
              )}
            </Box>
          )}

          {/* Tab 4: Documentos */}
          {tabAtual === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Documentos
              </Typography>
              {documentos && documentos.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Upload por</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentos.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.nomeArquivo}</TableCell>
                          <TableCell>
                            <Chip label={doc.tipo} size="small" />
                          </TableCell>
                          <TableCell>{doc.usuario?.nome || 'Admin'}</TableCell>
                          <TableCell>{formatarData(doc.createdAt)}</TableCell>
                          <TableCell>
                            {doc.valor ? formatarMoeda(doc.valor) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Nenhum documento cadastrado</Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerfilClinica;
