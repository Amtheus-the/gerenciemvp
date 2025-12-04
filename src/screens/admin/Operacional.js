/**
 * Página Operacional Admin
 * Interface para gerenciamento operacional dos usuários
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import operacionalService from '../../services/operacionalService';
import clinicaService from '../../services/clinicaService';

/**
 * Card de Usuário
 */
const UserCard = ({ usuario, onVerPerfil }) => {
  const saldo = parseFloat(usuario.valorTotalFaturamento || 0) - parseFloat(usuario.valorTotalDespesas || 0);
  const iniciaisNome = usuario.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatarData = (data) => {
    if (!data) return 'Sem registro';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Cabeçalho do Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 600,
              mr: 2
            }}
          >
            {iniciaisNome}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {usuario.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario.email}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={usuario.tipoPessoa}
                size="small"
                color={usuario.tipoPessoa === 'PF' ? 'primary' : 'success'}
                sx={{ fontSize: '0.7rem' }}
              />
              {!usuario.ativo && (
                <Chip
                  label="Inativo"
                  size="small"
                  color="default"
                  sx={{ ml: 0.5, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Clínica */}
        {usuario.nomeClinica && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            🏥 {usuario.nomeClinica}
          </Typography>
        )}

        {/* Estatísticas */}
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#00B389' }}>
                  {usuario.totalFaturamentos || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Faturamentos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF4873' }}>
                  {usuario.totalDespesas || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Despesas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary">
                  Saldo
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: saldo >= 0 ? '#00B389' : '#FF4873'
                  }}
                >
                  {formatarMoeda(saldo)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Informações Adicionais */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {usuario.totalDocumentos || 0} documentos
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Último lançamento: {formatarData(usuario.ultimoFaturamento || usuario.ultimaDespesa)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={() => onVerPerfil(usuario)}
        >
          Ver Perfil Completo
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Card de Clínica
 */
const ClinicaCard = ({ clinica, onVerPerfil }) => {
  const saldo = parseFloat(clinica.valorTotalFaturamento || 0) - parseFloat(clinica.valorTotalDespesas || 0);
  const iniciaisNome = clinica.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'C';

  const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Cabeçalho do Card */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 56, 
              height: 56,
              mr: 2,
              fontSize: '1.5rem'
            }}
          >
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {clinica.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {clinica.cpf || clinica.cnpj || 'Sem CPF/CNPJ'}
            </Typography>
          </Box>
        </Box>

        {/* Estatísticas */}
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Usuários
              </Typography>
            </Box>
            <Chip 
              label={clinica.numeroUsuarios || 0}
              size="small"
              color="default"
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
              <Typography variant="body2" color="text.secondary">
                Faturamento
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {formatarMoeda(clinica.valorTotalFaturamento)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <TrendingDownIcon fontSize="small" sx={{ mr: 0.5, color: 'error.main' }} />
              <Typography variant="body2" color="text.secondary">
                Despesas
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold" color="error.main">
              {formatarMoeda(clinica.valorTotalDespesas)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" fontWeight="bold">
              Saldo
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="bold"
              color={saldo >= 0 ? 'success.main' : 'error.main'}
            >
              {formatarMoeda(saldo)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={() => onVerPerfil(clinica)}
        >
          Ver Perfil da Clínica
        </Button>
      </CardActions>
    </Card>
  );
};

/**
 * Componente Principal - Painel Operacional
 */
const Operacional = () => {
  const navigate = useNavigate();
  const [modoVisualizacao, setModoVisualizacao] = useState('clinicas'); // 'usuarios' ou 'clinicas'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  /**
   * Carregar usuários
   */
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await operacionalService.listarUsuariosOperacional({
        page,
        limit: 12,
        search
      });

      setUsuarios(data.usuarios);
      setTotalPaginas(data.totalPaginas);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carregar clínicas
   */
  const carregarClinicas = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await clinicaService.listarClinicasOperacional({
        page,
        limit: 12,
        search
      });

      setClinicas(data.clinicas);
      setTotalPaginas(data.totalPaginas);
    } catch (err) {
      console.error('Erro ao carregar clínicas:', err);
      setError('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efeito para carregar dados conforme modo de visualização
   */
  useEffect(() => {
    if (modoVisualizacao === 'usuarios') {
      carregarUsuarios();
    } else {
      carregarClinicas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, modoVisualizacao]);

  /**
   * Buscar usuários
   */
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  /**
   * Ver perfil de usuário
   */
  const handleVerPerfilUsuario = (usuario) => {
    navigate(`/admin/operacional/usuario/${usuario.id}`);
  };

  /**
   * Ver perfil de clínica
   */
  const handleVerPerfilClinica = (clinica) => {
    navigate(`/admin/operacional/clinica/${clinica.id}`);
  };

  /**
   * Alternar modo de visualização
   */
  const handleModoChange = (event, novoModo) => {
    if (novoModo !== null) {
      setModoVisualizacao(novoModo);
      setPage(1);
      setSearch('');
      setSearchInput('');
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
          🏥 Painel Operacional
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie operações das clínicas e usuários, envie documentos e acompanhe lançamentos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Toggle de Visualização */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={modoVisualizacao}
          exclusive
          onChange={handleModoChange}
          color="primary"
        >
          <ToggleButton value="clinicas">
            <BusinessIcon sx={{ mr: 1 }} />
            Clínicas
          </ToggleButton>
          <ToggleButton value="usuarios">
            <PersonIcon sx={{ mr: 1 }} />
            Usuários
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Busca */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder={modoVisualizacao === 'clinicas' ? 'Buscar clínicas...' : 'Buscar usuários...'}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button variant="contained" onClick={handleSearch}>
                  Buscar
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Grid de Cards */}
      {modoVisualizacao === 'clinicas' ? (
        // Visualização de Clínicas
        clinicas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhuma clínica encontrada
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {clinicas.map((clinica) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={clinica.id}>
                  <ClinicaCard clinica={clinica} onVerPerfil={handleVerPerfilClinica} />
                </Grid>
              ))}
            </Grid>
          </>
        )
      ) : (
        // Visualização de Usuários
        usuarios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum usuário encontrado
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {usuarios.map((usuario) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={usuario.id}>
                  <UserCard usuario={usuario} onVerPerfil={handleVerPerfilUsuario} />
                </Grid>
              ))}
            </Grid>
          </>
        )
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPaginas}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default Operacional;
