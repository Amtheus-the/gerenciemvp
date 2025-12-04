import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Pressable, // Para simular o botão da data
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Para o Select
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assumindo MaterialIcons
import api from '../../services/api';

// Integração real com backend
const listarDespesas = async () => await api.get('/api/despesas');
const listarFaturamento = async () => await api.get('/api/faturamento');
const criarDespesa = async (data) => await api.post('/api/despesas', data);
const atualizarDespesa = async (id, data) => await api.put(`/api/despesas/${id}`, data);
const deletarDespesa = async (id) => await api.delete(`/api/despesas/${id}`);
const criarFaturamento = async (data) => await api.post('/api/faturamento', data);
const atualizarFaturamento = async (id, data) => await api.put(`/api/faturamento/${id}`, data);
const deletarFaturamento = async (id) => await api.delete(`/api/faturamento/${id}`);

/**
 * TabPanel para alternar entre abas (Adaptado para RN)
 */
const TabPanel = ({ children, value, index }) => {
  return (
    <View style={value === index ? styles.tabContent : styles.tabContentHidden}>
      {value === index && children}
    </View>
  );
};

/**
 * Componente customizado para Select (Picker)
 */
const CustomPicker = ({ label, value, onValueChange, items, required = false }) => (
  <View style={styles.formControl}>
    <Text style={styles.inputLabel}>{label} {required && <Text style={{ color: 'red' }}>*</Text>}</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={`Selecione ${label}`} value="" enabled={!required} />
        {items.map((item) => (
          <Picker.Item key={item.value || item} label={item.label || item} value={item.value || item} />
        ))}
      </Picker>
    </View>
  </View>
);

/**
 * Página de Lançamentos (Componente Principal)
 */
const Lancamentos = () => {
  const [tabValue, setTabValue] = useState(0); // 0: Despesas, 1: Faturamentos
  const [despesas, setDespesas] = useState([]);
  const [faturamentos, setFaturamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalTipo, setModalTipo] = useState('despesa'); // 'despesa' ou 'faturamento'
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    tipo: 'variavel',
    observacoes: '',
    // Faturamento
    paciente: '',
    procedimento: '',
    formaPagamento: '',
    tipoPessoa: 'PF'
  });

  // Listas de pacientes e procedimentos
  const [pacientes, setPacientes] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);

  const categoriasDespesas = [
    'Aluguel', 'Equipamentos', 'Materiais', 'Salários', 
    'Impostos', 'Marketing', 'Manutenção', 'Outros'
  ];

  const formasPagamento = [
    'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 
    'PIX', 'Transferência', 'Cheque', 'Outros'
  ];

  // Carrega dados ao montar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [despesasData, faturamentosData] = await Promise.all([
        listarDespesas(),
        listarFaturamento()
      ]);
      setDespesas(despesasData.data || []);
      setFaturamentos(faturamentosData.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar lançamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const abrirModalNovo = async (tipo) => {
    setModalTipo(tipo);
    setModoEdicao(false);
    setItemEdicao(null);
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      tipo: 'variavel',
      observacoes: '',
      paciente: '',
      procedimento: '',
      formaPagamento: '',
      tipoPessoa: 'PF'
    });
    if (tipo === 'faturamento') {
      try {
        setLoading(true);
          const [pacientesRes, procedimentosRes] = await Promise.all([
            api.get('/api/pacientes'),
            api.get('/api/procedimentos')
          ]);
        const pacientesList = (pacientesRes.data || []).map(p => ({ label: p.nome, value: p.id }));
        const procedimentosList = (procedimentosRes.data || []).map(p => ({ label: p.nome, value: p.id }));
        console.log('Pacientes carregados:', pacientesList);
        console.log('Procedimentos carregados:', procedimentosList);
        setPacientes(pacientesList);
        setProcedimentos(procedimentosList);
      } catch (err) {
        setError('Erro ao carregar pacientes/procedimentos');
        console.log('Erro ao carregar pacientes/procedimentos:', err);
      } finally {
        setLoading(false);
      }
    }
    setOpenModal(true);
  };

  const abrirModalEdicao = async (item, tipo) => {
    setModalTipo(tipo);
    setModoEdicao(true);
    setItemEdicao(item);
    setFormData({
      descricao: item.descricao || '',
      valor: String(item.valor || ''), 
      data: item.data || new Date().toISOString().split('T')[0],
      categoria: item.categoria || '',
      tipo: item.tipo || 'variavel',
      observacoes: item.observacoes || '',
      paciente: item.paciente || '',
      procedimento: item.procedimento || '',
      formaPagamento: item.formaPagamento || '',
      tipoPessoa: item.tipoPessoa || 'PF'
    });
    if (tipo === 'faturamento') {
      try {
        setLoading(true);
          const [pacientesRes, procedimentosRes] = await Promise.all([
            api.get('/api/pacientes'),
            api.get('/api/procedimentos')
          ]);
        const pacientesList = (pacientesRes.data || []).map(p => ({ label: p.nome, value: p.id }));
        const procedimentosList = (procedimentosRes.data || []).map(p => ({ label: p.nome, value: p.id }));
        console.log('Pacientes carregados (edição):', pacientesList);
        console.log('Procedimentos carregados (edição):', procedimentosList);
        setPacientes(pacientesList);
        setProcedimentos(procedimentosList);
      } catch (err) {
        setError('Erro ao carregar pacientes/procedimentos');
        console.log('Erro ao carregar pacientes/procedimentos (edição):', err);
      } finally {
        setLoading(false);
      }
    }
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validação básica (garante que valor é um número)
    if (isNaN(parseFloat(formData.valor))) {
        setError('O campo Valor deve ser um número válido.');
        return;
    }

    try {
      setLoading(true);

      if (modalTipo === 'despesa') {
        const dados = {
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data: formData.data,
          categoria: formData.categoria,
          tipo: formData.tipo,
          observacoes: formData.observacoes
        };

        if (modoEdicao) {
          await atualizarDespesa(itemEdicao.id, dados);
          setSuccess('Despesa atualizada com sucesso!');
        } else {
          await criarDespesa(dados);
          setSuccess('Despesa criada com sucesso!');
        }
      } else {
        const dados = {
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data: formData.data,
          paciente: formData.paciente,
          formaPagamento: formData.formaPagamento,
          tipoPessoa: formData.tipoPessoa,
          observacoes: formData.observacoes
        };

        if (modoEdicao) {
          await atualizarFaturamento(itemEdicao.id, dados);
          setSuccess('Faturamento atualizado com sucesso!');
        } else {
          await criarFaturamento(dados);
          setSuccess('Faturamento criado com sucesso!');
        }
      }

      fecharModal();
      carregarDados();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      // Erro pode ser diferente em RN, ajustar conforme a API de serviço
      const msgErro = err.message || 'Erro ao salvar lançamento'; 
      setError(msgErro);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = (id, tipo) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
                setLoading(true);
                if (tipo === 'despesa') {
                  await deletarDespesa(id);
                  setSuccess('Despesa excluída com sucesso!');
                } else {
                  await deletarFaturamento(id);
                  setSuccess('Faturamento excluído com sucesso!');
                }
                carregarDados();
                setTimeout(() => setSuccess(''), 3000);
              } catch (err) {
                console.error('Erro ao deletar:', err);
                setError('Erro ao excluir lançamento');
              } finally {
                setLoading(false);
              }
        }},
      ],
      { cancelable: true }
    );
  };

  const formatarData = (data) => {
    // Garante que a data está no formato correto para exibição (YYYY-MM-DD -> DD/MM/YYYY)
    if (!data) return '';
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatarMoeda = (valor) => {
    // Converte para float antes de formatar
    const num = parseFloat(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // --- Renderização da Tabela (FlatList) ---

  const renderDespesaItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{formatarData(item.data)}</Text>
      <Text style={styles.tableCell}>{item.descricao}</Text>
      <Text style={styles.tableCell}>{item.categoria}</Text>
      <View style={styles.tableCell}>
        <View style={[styles.chip, item.tipo === 'fixa' ? styles.chipPrimary : styles.chipDefault]}>
          <Text style={styles.chipText}>{item.tipo}</Text>
        </View>
      </View>
      <Text style={[styles.tableCell, styles.alignRight]}>{formatarMoeda(item.valor)}</Text>
      <View style={styles.tableCellActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => abrirModalEdicao(item, 'despesa')}>
          <Icon name="edit" size={18} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleDeletar(item.id, 'despesa')}>
          <Icon name="delete" size={18} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFaturamentoItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{formatarData(item.data)}</Text>
      <Text style={styles.tableCell}>{item.descricao}</Text>
      <Text style={styles.tableCell}>{item.paciente}</Text>
      <View style={styles.tableCell}>
        <View style={[styles.chip, item.tipoPessoa === 'PJ' ? styles.chipSecondary : styles.chipPrimary]}>
          <Text style={styles.chipText}>{item.tipoPessoa}</Text>
        </View>
      </View>
      <Text style={styles.tableCell}>{item.formaPagamento}</Text>
      <Text style={[styles.tableCell, styles.alignRight]}>{formatarMoeda(item.valor)}</Text>
      <View style={styles.tableCellActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => abrirModalEdicao(item, 'faturamento')}>
          <Icon name="edit" size={18} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleDeletar(item.id, 'faturamento')}>
          <Icon name="delete" size={18} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const TableHeader = ({ isDespesa }) => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderCell}>Data</Text>
      <Text style={styles.tableHeaderCell}>Descrição</Text>
      {isDespesa ? (
        <Text style={styles.tableHeaderCell}>Categoria</Text>
      ) : (
        <Text style={styles.tableHeaderCell}>Paciente</Text>
      )}
      <Text style={styles.tableHeaderCell}>Tipo</Text>
      {isDespesa ? (
        <Text style={[styles.tableHeaderCell, styles.alignRight]}>Valor</Text>
      ) : (
        <Text style={styles.tableHeaderCell}>Forma Pgto</Text>
      )}
      {!isDespesa && <Text style={[styles.tableHeaderCell, styles.alignRight]}>Valor</Text>}
      <Text style={[styles.tableHeaderCell, styles.alignCenter]}>Ações</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Lançamentos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => abrirModalNovo(tabValue === 0 ? 'despesa' : 'faturamento')}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novo Lançamento</Text>
        </TouchableOpacity>
      </View>

      {/* Alertas */}
      {error && (
        <View style={[styles.alert, styles.alertError]}>
          <Text style={styles.alertText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={[styles.alert, styles.alertSuccess]}>
          <Text style={styles.alertText}>{success}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, tabValue === 0 && styles.activeTab]} 
          onPress={() => handleTabChange(0)}
        >
          <Text style={[styles.tabText, tabValue === 0 && styles.activeTabText]}>
            Despesas ({despesas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tabValue === 1 && styles.activeTab]} 
          onPress={() => handleTabChange(1)}
        >
          <Text style={[styles.tabText, tabValue === 1 && styles.activeTabText]}>
            Faturamentos ({faturamentos.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Aba de Despesas */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : despesas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma despesa cadastrada ainda.</Text>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => abrirModalNovo('despesa')}
              >
                <Icon name="add" size={20} color="#3f51b5" />
                <Text style={styles.outlineButtonText}>Adicionar primeira despesa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={despesas}
              renderItem={renderDespesaItem}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={<TableHeader isDespesa={true} />}
              style={styles.tableWrapper}
            />
          )}
        </TabPanel>

        {/* Aba de Faturamento */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : faturamentos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum faturamento cadastrado ainda.</Text>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => abrirModalNovo('faturamento')}
              >
                <Icon name="add" size={20} color="#3f51b5" />
                <Text style={styles.outlineButtonText}>Adicionar primeiro faturamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={faturamentos}
              renderItem={renderFaturamentoItem}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={<TableHeader isDespesa={false} />}
              style={styles.tableWrapper}
            />
          )}
        </TabPanel>
      </ScrollView>

      {/* Modal de Criar/Editar */}
      <RNModal
        animationType="slide"
        transparent={true}
        visible={openModal}
        onRequestClose={fecharModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modoEdicao ? 'Editar' : 'Novo'} {modalTipo === 'despesa' ? 'Despesa' : 'Faturamento'}
              </Text>
              <TouchableOpacity onPress={fecharModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder="Descrição *"
                value={formData.descricao}
                onChangeText={(text) => setFormData({ ...formData, descricao: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Valor *"
                keyboardType="numeric"
                value={formData.valor}
                onChangeText={(text) => setFormData({ ...formData, valor: text.replace(',', '.') })}
              />

              <Pressable 
                  style={styles.input} 
                  onPress={() => Alert.alert('Ação', 'Em um app real, aqui abriria um DatePicker nativo.')}>
                  <Text>{formData.data ? `Data: ${formatarData(formData.data)}` : 'Data *'}</Text>
                  {/* Manter como TextInput simples para a conversão ser fiel ao tipo 'date' do original */}
                  <TextInput
                    style={{ position: 'absolute', width: '100%', opacity: 1}} 
                    placeholder="Data (YYYY-MM-DD) *"
                    value={formData.data}
                    onChangeText={(text) => setFormData({ ...formData, data: text })}
                  />
              </Pressable>


              {modalTipo === 'despesa' ? (
                <>
                  <CustomPicker
                    label="Categoria"
                    value={formData.categoria}
                    onValueChange={(itemValue) => setFormData({ ...formData, categoria: itemValue })}
                    items={categoriasDespesas}
                    required={true}
                  />

                  <CustomPicker
                    label="Tipo"
                    value={formData.tipo}
                    onValueChange={(itemValue) => setFormData({ ...formData, tipo: itemValue })}
                    items={[{ label: 'Fixa', value: 'fixa' }, { label: 'Variável', value: 'variavel' }]}
                  />
                </>
              ) : (
                <>
                  <CustomPicker
                    label="Paciente"
                    value={formData.paciente}
                    onValueChange={(itemValue) => setFormData({ ...formData, paciente: itemValue })}
                    items={pacientes}
                    required={true}
                  />

                  <CustomPicker
                    label="Procedimento"
                    value={formData.procedimento}
                    onValueChange={(itemValue) => setFormData({ ...formData, procedimento: itemValue })}
                    items={procedimentos}
                    required={true}
                  />

                  <CustomPicker
                    label="Forma de Pagamento"
                    value={formData.formaPagamento}
                    onValueChange={(itemValue) => setFormData({ ...formData, formaPagamento: itemValue })}
                    items={formasPagamento}
                    required={true}
                  />

                  <CustomPicker
                    label="Tipo de Pessoa"
                    value={formData.tipoPessoa}
                    onValueChange={(itemValue) => setFormData({ ...formData, tipoPessoa: itemValue })}
                    items={[{ label: 'Pessoa Física', value: 'PF' }, { label: 'Pessoa Jurídica', value: 'PJ' }]}
                    required={true}
                  />
                </>
              )}

              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Observações"
                multiline={true}
                numberOfLines={3}
                value={formData.observacoes}
                onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.buttonCancel} onPress={fecharModal}>
                <Text style={styles.buttonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonTextPrimary}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3f51b5',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  alert: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  alertError: {
    backgroundColor: '#f44336', // Cor do erro
  },
  alertSuccess: {
    backgroundColor: '#4caf50', // Cor de sucesso
  },
  alertText: {
    color: '#fff',
  },
  // Tabs
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
    borderBottomColor: '#3f51b5',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  tabContent: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  tabContentHidden: {
    height: 0,
    overflow: 'hidden',
  },
  // Tabela (simulada com FlatList)
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
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
  alignRight: {
    textAlign: 'right',
  },
  alignCenter: {
    textAlign: 'center',
  },
  tableCellActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  chip: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  chipPrimary: {
    backgroundColor: '#3f51b5',
  },
  chipSecondary: {
    backgroundColor: '#f50057',
  },
  chipDefault: {
    backgroundColor: '#ccc',
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    marginBottom: 10,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f51b5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  outlineButtonText: {
    color: '#3f51b5',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  // Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  formControl: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 5,
  },
  inputLabel: {
    position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 5,
    zIndex: 1,
    fontSize: 12,
    color: '#666',
  },
  pickerContainer: {
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonCancel: {
    padding: 10,
    marginRight: 10,
  },
  buttonTextCancel: {
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  buttonPrimary: {
    backgroundColor: '#3f51b5',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Lancamentos;