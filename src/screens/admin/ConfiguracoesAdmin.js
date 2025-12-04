/**
 * Página de Configurações do Sistema - Admin
 * Configurações gerais da plataforma
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const ConfiguracoesAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // Estados de configuração
  const [config, setConfig] = useState({
    nomeEmpresa: 'Gerencie - Contabilidade Digital',
    emailContato: 'contato@gerencie.com.br',
    telefone: '(11) 99999-9999',
    permitirNovosRegistros: true,
    enviarEmailBoasVindas: true,
    limiteLancamentosMes: 1000,
    limiteUsuarios: 500,
    manutencao: false,
  });

  const handleSalvar = () => {
    setSucesso('Configurações salvas com sucesso!');
    setTimeout(() => setSucesso(''), 3000);
  };

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Configurações do Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as configurações gerais da plataforma
          </Typography>
        </Box>

        {sucesso && <Alert severity="success" sx={{ mb: 3 }}>{sucesso}</Alert>}
        {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

        <Grid container spacing={3}>
          {/* Informações da Empresa */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações da Empresa
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  fullWidth
                  label="Nome da Empresa"
                  value={config.nomeEmpresa}
                  onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email de Contato"
                  value={config.emailContato}
                  onChange={(e) => setConfig({ ...config, emailContato: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Telefone"
                  value={config.telefone}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Configurações do Sistema */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configurações do Sistema
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.permitirNovosRegistros}
                      onChange={(e) =>
                        setConfig({ ...config, permitirNovosRegistros: e.target.checked })
                      }
                    />
                  }
                  label="Permitir novos registros"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enviarEmailBoasVindas}
                      onChange={(e) =>
                        setConfig({ ...config, enviarEmailBoasVindas: e.target.checked })
                      }
                    />
                  }
                  label="Enviar email de boas-vindas"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.manutencao}
                      onChange={(e) => setConfig({ ...config, manutencao: e.target.checked })}
                      color="error"
                    />
                  }
                  label="Modo manutenção"
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Limite de lançamentos por mês"
                  value={config.limiteLancamentosMes}
                  onChange={(e) =>
                    setConfig({ ...config, limiteLancamentosMes: parseInt(e.target.value) })
                  }
                  sx={{ mt: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Limite de usuários"
                  value={config.limiteUsuarios}
                  onChange={(e) =>
                    setConfig({ ...config, limiteUsuarios: parseInt(e.target.value) })
                  }
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Botão de Salvar */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSalvar}
              >
                Salvar Configurações
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ConfiguracoesAdmin;
