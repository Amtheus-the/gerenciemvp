/**
 * Página de Relatórios Administrativos
 * Relatórios consolidados e exportação de dados
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const RelatoriosAdmin = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState('usuarios');
  const [periodo, setPeriodo] = useState('mes');

  const handleExportar = (formato) => {
    alert(`Exportando relatório em formato ${formato.toUpperCase()}...`);
  };

  // Dados de exemplo
  const dadosRelatorio = [
    { id: 1, nome: 'João Silva', email: 'joao@email.com', tipo: 'PF', status: 'Ativo', lancamentos: 45 },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', tipo: 'PJ', status: 'Ativo', lancamentos: 78 },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', tipo: 'HIBRIDO', status: 'Ativo', lancamentos: 32 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          📊 Relatórios Administrativos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gere e exporte relatórios consolidados
        </Typography>
      </Box>

        <Grid container spacing={3}>
          {/* Filtros */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Relatório</InputLabel>
                      <Select
                        value={tipoRelatorio}
                        label="Tipo de Relatório"
                        onChange={(e) => setTipoRelatorio(e.target.value)}
                      >
                        <MenuItem value="usuarios">Usuários</MenuItem>
                        <MenuItem value="lancamentos">Lançamentos</MenuItem>
                        <MenuItem value="financeiro">Financeiro</MenuItem>
                        <MenuItem value="analises">Análises</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Período</InputLabel>
                      <Select
                        value={periodo}
                        label="Período"
                        onChange={(e) => setPeriodo(e.target.value)}
                      >
                        <MenuItem value="hoje">Hoje</MenuItem>
                        <MenuItem value="semana">Esta semana</MenuItem>
                        <MenuItem value="mes">Este mês</MenuItem>
                        <MenuItem value="trimestre">Este trimestre</MenuItem>
                        <MenuItem value="ano">Este ano</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PdfIcon />}
                        onClick={() => handleExportar('pdf')}
                      >
                        PDF
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExportar('excel')}
                      >
                        Excel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabela de Dados */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Relatório de {tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)} - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Lançamentos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dadosRelatorio.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.nome}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.tipo}
                              size="small"
                              color={
                                row.tipo === 'PF'
                                  ? 'primary'
                                  : row.tipo === 'PJ'
                                  ? 'success'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={row.status} size="small" color="success" />
                          </TableCell>
                          <TableCell align="right">{row.lancamentos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumo */}
          <Grid item xs={12}>
            <Alert severity="info">
              Este relatório contém {dadosRelatorio.length} registros no período selecionado.
            </Alert>
          </Grid>
        </Grid>
    </Box>
  );
};

export default RelatoriosAdmin;
