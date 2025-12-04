/**
 * Página de Cadastro de Clínica
 * Cadastro inicial simplificado: CNPJ, Nome e Telefone
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import clinicaService from '../../services/clinicaService';

const CadastroClinica = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    tipoPessoa: 'PJ',
    cpf: '',
    cnpj: '',
    telefone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErro('');
  };

  const formatarCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatarCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
      .substring(0, 14);
  };

  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleCNPJChange = (e) => {
    const formatted = formatarCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
    setErro('');
  };

  const handleCPFChange = (e) => {
    const formatted = formatarCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    setErro('');
  };

  const handleTelefoneChange = (e) => {
    const formatted = formatarTelefone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
    setErro('');
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('Nome da clínica é obrigatório');
      return false;
    }

    if (formData.tipoPessoa === 'PJ') {
      const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
      if (!cnpjLimpo || cnpjLimpo.length !== 14) {
        setErro('CNPJ inválido. Digite os 14 dígitos');
        return false;
      }
    }

    if (formData.tipoPessoa === 'PF') {
      const cpfLimpo = formData.cpf.replace(/\D/g, '');
      if (!cpfLimpo || cpfLimpo.length !== 11) {
        setErro('CPF inválido. Digite os 11 dígitos');
        return false;
      }
    }

    if (!formData.telefone.trim()) {
      setErro('Telefone é obrigatório');
      return false;
    }

    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
      setErro('Telefone inválido. Digite DDD + número');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      // Preparar dados para envio
      const dadosClinica = {
        nome: formData.nome.trim(),
        tipoPessoa: formData.tipoPessoa,
        telefone: formData.telefone,
        plano: 'FREE', // Plano padrão
        limiteUsuarios: 3, // Limite padrão para plano FREE
        ativo: true
      };

      // Adicionar CPF ou CNPJ dependendo do tipo
      if (formData.tipoPessoa === 'PJ') {
        dadosClinica.cnpj = formData.cnpj.replace(/\D/g, '');
      } else {
        dadosClinica.cpf = formData.cpf.replace(/\D/g, '');
      }

      const response = await clinicaService.criarClinica(dadosClinica);

      setSucesso('Clínica cadastrada com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/admin/operacional');
      }, 2000);

    } catch (error) {
      console.error('Erro ao cadastrar clínica:', error);
      setErro(error.response?.data?.error || 'Erro ao cadastrar clínica. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/operacional')}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Nova Clínica
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastro inicial - depois você poderá completar os dados
            </Typography>
          </Box>
        </Box>

        {erro && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erro}
          </Alert>
        )}

        {sucesso && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {sucesso}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Tipo de Pessoa */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Pessoa</InputLabel>
                <Select
                  name="tipoPessoa"
                  value={formData.tipoPessoa}
                  onChange={handleChange}
                  label="Tipo de Pessoa"
                >
                  <MenuItem value="PJ">Pessoa Jurídica (CNPJ)</MenuItem>
                  <MenuItem value="PF">Pessoa Física (CPF)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Nome da Clínica */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nome da Clínica"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Clínica Odontológica Sorriso"
                inputProps={{ maxLength: 255 }}
              />
            </Grid>

            {/* CNPJ ou CPF */}
            {formData.tipoPessoa === 'PJ' ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="CNPJ"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  placeholder="00.000.000/0000-00"
                  inputProps={{ maxLength: 18 }}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  inputProps={{ maxLength: 14 }}
                />
              </Grid>
            )}

            {/* Telefone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                inputProps={{ maxLength: 15 }}
              />
            </Grid>

            {/* Informação sobre próximos passos */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  📋 Após criar a clínica, você poderá adicionar:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>Endereço completo</li>
                  <li>E-mail</li>
                  <li>Telefone secundário</li>
                  <li>Plano e limite de usuários</li>
                  <li>Outros dados complementares</li>
                </Typography>
              </Alert>
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/operacional')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <BusinessIcon />}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Clínica'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CadastroClinica;
