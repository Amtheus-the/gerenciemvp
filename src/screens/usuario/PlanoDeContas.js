
import React, { useState, useEffect } from 'react';
import planoContasService from '../../services/planoContasService';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';

const PlanoDeContas = () => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  // debugInfo removido
  useEffect(() => {
    carregarContas();
  }, []);

  const carregarContas = async () => {
    try {
      setLoading(true);
  // debugInfo removido
      const data = await planoContasService.listar();
  // debugInfo removido
      setContas(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      let msg = 'Erro ao carregar plano de contas';
      if (err.response) {
        msg += `\nStatus: ${err.response.status}`;
        msg += `\nData: ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        msg += `\nMessage: ${err.message}`;
      }
  // debugInfo removido
      setError(msg);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };
  const [tabValue, setTabValue] = useState(0); // 0 = Dedutíveis, 1 = Não Dedutíveis
  const [nome, setNome] = useState('');
  const [dedutivel, setDedutivel] = useState(true);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const contasDedutiveis = contas.filter(c => c.dedutivel);
  const contasNaoDedutiveis = contas.filter(c => !c.dedutivel);
  const contasExibidas = tabValue === 0 ? contasDedutiveis : contasNaoDedutiveis;

  const handleAdicionar = async () => {
    if (!nome.trim()) {
      setError('Digite o nome da natureza');
      return;
    }
    try {
      setLoading(true);
      if (editando) {
        await planoContasService.atualizar(editando.id, { nome, dedutivel });
        setSuccess('Natureza atualizada!');
      } else {
        await planoContasService.criar({ nome, dedutivel });
        setSuccess('Natureza adicionada!');
      }
      setNome('');
      setDedutivel(true);
      setEditando(null);
      carregarContas();
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Erro ao salvar natureza');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (conta) => {
    setEditando(conta);
    setNome(conta.nome);
    setDedutivel(conta.dedutivel);
    setTabValue(conta.dedutivel ? 0 : 1);
  };

  const handleCancelarEdicao = () => {
    setEditando(null);
    setNome('');
    setDedutivel(true);
  };

  const handleDeletar = (id) => {
    Alert.alert('Confirmação', 'Deseja realmente excluir esta natureza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          setLoading(true);
          await planoContasService.deletar(id);
          setSuccess('Natureza excluída!');
          carregarContas();
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          setError('Erro ao excluir natureza');
        } finally {
          setLoading(false);
        }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Plano de Contas</Text>
      <Text style={styles.subtitle}>Cadastre as naturezas de despesas para classificação fiscal</Text>

      {/* Alertas */}
      {error ? <Text style={styles.alertError}>{error}</Text> : null}
      {success ? <Text style={styles.alertSuccess}>{success}</Text> : null}
      {/* debugInfo removido */}

      {/* Formulário Inline */}
      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Natureza"
          value={nome}
          onChangeText={setNome}
        />
        <TouchableOpacity
          style={[styles.checkbox, dedutivel && styles.checkboxChecked]}
          onPress={() => setDedutivel(!dedutivel)}
        >
          <Text style={styles.checkboxLabel}>{dedutivel ? 'Dedutível' : 'Não Dedutível'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handleAdicionar}
        >
          <Text style={styles.buttonText}>{editando ? 'Atualizar' : 'Adicionar'}</Text>
        </TouchableOpacity>
        {editando && (
          <TouchableOpacity style={styles.buttonCancel} onPress={handleCancelarEdicao}>
            <Text style={styles.buttonTextCancel}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Abas Dedutíveis / Não Dedutíveis */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tabValue === 0 && styles.activeTab]}
          onPress={() => setTabValue(0)}
        >
          <Text style={[styles.tabText, tabValue === 0 && styles.activeTabText]}>Dedutíveis ({contasDedutiveis.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabValue === 1 && styles.activeTab]}
          onPress={() => setTabValue(1)}
        >
          <Text style={[styles.tabText, tabValue === 1 && styles.activeTabText]}>Não Dedutíveis ({contasNaoDedutiveis.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Nome</Text>
          <Text style={styles.tableHeaderCell}>Ações</Text>
        </View>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Carregando...</Text>
          </View>
        ) : contasExibidas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma natureza cadastrada</Text>
          </View>
        ) : (
          <FlatList
            data={contasExibidas}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.nome}</Text>
                <View style={styles.tableCellActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleEditar(item)}>
                    <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeletar(item.id)}>
                    <Text style={{ color: '#f44336', fontWeight: 'bold' }}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  checkbox: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginLeft: 8,
  },
  checkboxChecked: {
    borderColor: '#1976d2',
  },
  checkboxLabel: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonCancel: {
    backgroundColor: '#fff',
    borderColor: '#1976d2',
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonTextCancel: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    elevation: 1,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1976d2',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f0f0f0',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  tableCellActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    padding: 5,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
  },
  alertError: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  alertSuccess: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default PlanoDeContas;
