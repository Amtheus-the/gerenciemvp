/**
 * Página de Perfil Completo do Usuário
 * Visualização completa de todos os dados do usuário para admin
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
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import operacionalService from '../../services/operacionalService';

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
 * Componente Principal - Perfil Completo do Usuário
 */
const PerfilUsuario = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para upload de documento
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    tipo: 'nota_fiscal',
    descricao: '',
    dataEmissao: '',
    valor: '',
    observacoes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, [userId]);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await operacionalService.getPerfilCompleto(userId);
      setPerfil(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
    setUploadData({
      tipo: 'nota_fiscal',
      descricao: '',
      dataEmissao: '',
      valor: '',
      observacoes: ''
    });
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      alert('Selecione um arquivo');
      return;
    }

    try {
      setUploading(true);
      await operacionalService.uploadDocumento(userId, uploadData, selectedFile);
      handleUploadClose();
      carregarPerfil(); // Recarregar perfil para atualizar documentos
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocumento = async (documentoId) => {
    try {
      await operacionalService.downloadDocumento(documentoId);
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      alert('Erro ao fazer download do documento');
    }
  };

  const handleDeleteDocumento = async (documentoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await operacionalService.deleteDocumento(documentoId);
      carregarPerfil(); // Recarregar perfil
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      alert('Erro ao excluir documento');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !perfil) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Perfil não encontrado'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/operacional')} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    );
  }

  const { usuario, estatisticas, faturamentos, despesas, documentos } = perfil;

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/operacional')}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ width: 60, height: 60, fontSize: '1.5rem', bgcolor: 'primary.main' }}>
            {usuario.nome?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {usuario.nome}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {usuario.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={usuario.ativo ? 'Ativo' : 'Inativo'}
          color={usuario.ativo ? 'success' : 'default'}
          sx={{ fontSize: '1rem', px: 2, py: 3 }}
        />
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Faturamento Total"
            value={formatarMoeda(estatisticas.valorTotalFaturamento)}
            icon={TrendingUpIcon}
            color="#00B389"
            subtitle={`${estatisticas.totalFaturamentos} lançamentos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Despesas Totais"
            value={formatarMoeda(estatisticas.valorTotalDespesas)}
            icon={TrendingDownIcon}
            color="#FF4873"
            subtitle={`${estatisticas.totalDespesas} lançamentos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo"
            value={formatarMoeda(estatisticas.saldo)}
            icon={AccountBalanceIcon}
            color={estatisticas.saldo >= 0 ? '#00B389' : '#FF4873'}
            subtitle={estatisticas.saldo >= 0 ? 'Positivo' : 'Negativo'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Documentos"
            value={estatisticas.totalDocumentos}
            icon={DescriptionIcon}
            color="#007bff"
            subtitle="Arquivos salvos"
          />
        </Grid>
      </Grid>

      {/* Tabs de Conteúdo */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Informações Gerais" />
            <Tab label={`Faturamentos (${faturamentos.length})`} />
            <Tab label={`Despesas (${despesas.length})`} />
            <Tab label={`Documentos (${documentos.length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Aba 0: Informações Gerais */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Dados Pessoais
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Nome" secondary={usuario.nome} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><EmailIcon /></ListItemIcon>
                        <ListItemText primary="Email" secondary={usuario.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PhoneIcon /></ListItemIcon>
                        <ListItemText primary="Telefone" secondary={usuario.telefone || 'Não informado'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BusinessIcon /></ListItemIcon>
                        <ListItemText primary="Tipo de Pessoa" secondary={usuario.tipoPessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Cadastrado em" secondary={formatarData(usuario.createdAt)} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Informações da Clínica
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText primary="Nome da Clínica" secondary={usuario.nomeClinica || 'Não informado'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="CRO" secondary={usuario.cro || 'Não informado'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="CPF/CNPJ" secondary={usuario.cpf || usuario.cnpj || 'Não informado'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Profissão" secondary={usuario.profissao || 'Dentista'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Análise Financeira
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Impostos Estimados:</Typography>
                      <Typography fontWeight={600} color="warning.main">
                        {formatarMoeda(estatisticas.impostosEstimados)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Lucro Líquido Estimado:</Typography>
                      <Typography fontWeight={700} color={estatisticas.lucroLiquido >= 0 ? 'success.main' : 'error.main'}>
                        {formatarMoeda(estatisticas.lucroLiquido)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Aba 1: Faturamentos */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Histórico de Faturamentos
              </Typography>
              {faturamentos.length === 0 ? (
                <Alert severity="info">Nenhum faturamento registrado</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Procedimento</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faturamentos.map((fat) => (
                        <TableRow key={fat.id}>
                          <TableCell>{formatarData(fat.data)}</TableCell>
                          <TableCell>{fat.paciente || 'Não informado'}</TableCell>
                          <TableCell>{fat.procedimento || 'Não informado'}</TableCell>
                          <TableCell align="right">
                            <Typography color="success.main" fontWeight={600}>
                              {formatarMoeda(fat.valor)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" align="right">
                  Total: {formatarMoeda(estatisticas.valorTotalFaturamento)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Aba 2: Despesas */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Histórico de Despesas
              </Typography>
              {despesas.length === 0 ? (
                <Alert severity="info">Nenhuma despesa registrada</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {despesas.map((desp) => (
                        <TableRow key={desp.id}>
                          <TableCell>{formatarData(desp.data)}</TableCell>
                          <TableCell>{desp.descricao}</TableCell>
                          <TableCell>{desp.categoria}</TableCell>
                          <TableCell align="right">
                            <Typography color="error.main" fontWeight={600}>
                              {formatarMoeda(desp.valor)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="h6" align="right">
                  Total: {formatarMoeda(estatisticas.valorTotalDespesas)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Aba 3: Documentos */}
          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Documentos Anexados
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUploadClick}
                >
                  Fazer Upload
                </Button>
              </Box>

              {documentos.length === 0 ? (
                <Alert severity="info">Nenhum documento anexado</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Nome do Arquivo</TableCell>
                        <TableCell>Data de Upload</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentos.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Chip
                              label={doc.tipo.replace('_', ' ').toUpperCase()}
                              size="small"
                              color={doc.tipo === 'nota_fiscal' ? 'primary' : doc.tipo === 'recibo' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{doc.nomeArquivo}</TableCell>
                          <TableCell>{formatarData(doc.createdAt)}</TableCell>
                          <TableCell>{doc.valor ? formatarMoeda(doc.valor) : '-'}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Download">
                              <IconButton size="small" onClick={() => handleDownloadDocumento(doc.id)}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton size="small" color="error" onClick={() => handleDeleteDocumento(doc.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>Fazer Upload de Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                value={uploadData.tipo}
                label="Tipo de Documento"
                onChange={(e) => setUploadData({ ...uploadData, tipo: e.target.value })}
              >
                <MenuItem value="nota_fiscal">Nota Fiscal</MenuItem>
                <MenuItem value="recibo">Recibo</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Descrição"
              fullWidth
              value={uploadData.descricao}
              onChange={(e) => setUploadData({ ...uploadData, descricao: e.target.value })}
            />

            <TextField
              label="Data de Emissão"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={uploadData.dataEmissao}
              onChange={(e) => setUploadData({ ...uploadData, dataEmissao: e.target.value })}
            />

            <TextField
              label="Valor (opcional)"
              type="number"
              fullWidth
              value={uploadData.valor}
              onChange={(e) => setUploadData({ ...uploadData, valor: e.target.value })}
            />

            <TextField
              label="Observações"
              fullWidth
              multiline
              rows={3}
              value={uploadData.observacoes}
              onChange={(e) => setUploadData({ ...uploadData, observacoes: e.target.value })}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Escolher Arquivo'}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>Cancelar</Button>
          <Button onClick={handleUploadSubmit} variant="contained" disabled={uploading || !selectedFile}>
            {uploading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerfilUsuario;
