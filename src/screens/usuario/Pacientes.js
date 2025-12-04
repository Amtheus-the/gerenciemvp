import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert, // Para confirmação de exclusão
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Para o Select
import Icon from 'react-native-vector-icons/MaterialIcons'; // Para os ícones

// Importe o serviço (presume-se que seja compatível com React Native)
import pacienteService from '../../services/pacienteService'; 

// --- Componentes Auxiliares (Simulando MUI) ---

// Componente para simular o Chip (Status/Tipo)
const Chip = ({ label, color, style }) => (
  <View style={[styles.chip, color === 'success' ? styles.chipSuccess : styles.chipPrimary, style]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

// Componente para simular o Alert
const CustomAlert = ({ message, severity, onClose }) => {
  if (!message) return null;

  const style = severity === 'error' ? styles.alertError : styles.alertSuccess;
  const iconName = severity === 'error' ? 'error' : 'check-circle';

  return (
    <View style={style}>
      <Icon name={iconName} size={20} color="#fff" style={styles.alertIcon} />
      <Text style={styles.alertText}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.alertClose}>
        <Icon name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// --- Componente Principal ---

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    tipoPessoa: 'PF',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: '',
    ativo: true,
  });

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      setLoading(true);
      console.log('🔵 Carregando pacientes...');
      // Substituir o serviço pela lógica de carregamento do React Native
      const data = await pacienteService.listar(); 
      console.log('✅ Dados recebidos:', data);
      setPacientes(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar pacientes');
      console.error('❌ Erro ao carregar:', err);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (paciente = null) => {
    if (paciente) {
      setEditando(paciente);
      setFormData(paciente);
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        cpfCnpj: '',
        tipoPessoa: 'PF',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        observacoes: '',
        ativo: true,
      });
    }
    setModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const handleChange = (name, value) => {
    // Auto-formatar CPF/CNPJ
    if (name === 'cpfCnpj') {
      const formatted = formatarCPFCNPJ(value, formData.tipoPessoa);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'tipoPessoa') {
      setFormData({ ...formData, [name]: value, cpfCnpj: '' });
    } else if (name === 'estado') {
        // Para garantir que o estado seja sempre em maiúsculas
        setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formatarCPFCNPJ = (valor, tipo) => {
    const numeros = valor.replace(/\D/g, '');

    if (tipo === 'PF') {
      // Formato: 000.000.000-00
      if (numeros.length <= 11) {
        return numeros
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
    } else {
      // Formato: 00.000.000/0000-00
      if (numeros.length <= 14) {
        return numeros
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      }
    }

    return valor;
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.nome) {
        setError('O nome é obrigatório.');
        return;
    }

    try {
      if (editando) {
        await pacienteService.atualizar(editando.id, formData);
        setSuccess('Paciente atualizado com sucesso!');
      } else {
        await pacienteService.criar(formData);
        setSuccess('Paciente cadastrado com sucesso!');
      }

      handleCloseModal();
      carregarPacientes();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao salvar paciente');
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente excluir este paciente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: async () => {
          try {
            await pacienteService.deletar(id);
            setSuccess('Paciente excluído com sucesso!');
            carregarPacientes();
            setTimeout(() => setSuccess(''), 3000);
          } catch (err) {
            setError('Erro ao excluir paciente');
            console.error(err);
          }
        }},
      ],
      { cancelable: true }
    );
  };

  const pacientesFiltrados = (pacientes || []).filter(p =>
    p.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (p.cpfCnpj && p.cpfCnpj.includes(pesquisa))
  );
  
  // --- Modal (Simulando Dialog) ---
  const ModalCadastro = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editando ? 'Editar Paciente' : 'Novo Paciente'}
          </Text>
          <TouchableOpacity onPress={handleCloseModal}>
             <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          {error && <CustomAlert message={error} severity="error" onClose={() => setError('')} />}

          <Text style={styles.inputLabel}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={formData.nome}
            onChangeText={(text) => handleChange('nome', text)}
          />

          <Text style={styles.inputLabel}>Tipo *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipoPessoa}
              onValueChange={(itemValue) => handleChange('tipoPessoa', itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pessoa Física" value="PF" />
              <Picker.Item label="Pessoa Jurídica" value="PJ" />
            </Picker>
          </View>

          <Text style={styles.inputLabel}>{formData.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}</Text>
          <TextInput
            style={styles.input}
            placeholder={formData.tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
            keyboardType="numeric"
            value={formData.cpfCnpj}
            onChangeText={(text) => handleChange('cpfCnpj', text)}
            maxLength={formData.tipoPessoa === 'PF' ? 14 : 18}
          />

          <Text style={styles.inputLabel}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="(99) 99999-9999"
            keyboardType="phone-pad"
            value={formData.telefone}
            onChangeText={(text) => handleChange('telefone', text)}
          />

          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@email.com"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
          />
          
          <Text style={styles.sectionTitle}>Endereço</Text>

          <Text style={styles.inputLabel}>CEP</Text>
          <TextInput
            style={styles.input}
            placeholder="00000-000"
            keyboardType="numeric"
            value={formData.cep}
            onChangeText={(text) => handleChange('cep', text)}
          />

          <Text style={styles.inputLabel}>Logradouro</Text>
          <TextInput
            style={styles.input}
            placeholder="Rua, Avenida, etc."
            value={formData.logradouro}
            onChangeText={(text) => handleChange('logradouro', text)}
          />

          <Text style={styles.inputLabel}>Número</Text>
          <TextInput
            style={styles.input}
            placeholder="000"
            keyboardType="numeric"
            value={formData.numero}
            onChangeText={(text) => handleChange('numero', text)}
          />
          
          <Text style={styles.inputLabel}>Complemento</Text>
          <TextInput
            style={styles.input}
            placeholder="Apto, Bloco, etc."
            value={formData.complemento}
            onChangeText={(text) => handleChange('complemento', text)}
          />
          
          <Text style={styles.inputLabel}>Bairro</Text>
          <TextInput
            style={styles.input}
            placeholder="Bairro"
            value={formData.bairro}
            onChangeText={(text) => handleChange('bairro', text)}
          />

          <Text style={styles.inputLabel}>Cidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={formData.cidade}
            onChangeText={(text) => handleChange('cidade', text)}
          />

          <Text style={styles.inputLabel}>UF</Text>
          <TextInput
            style={styles.input}
            placeholder="UF"
            maxLength={2}
            value={formData.estado}
            onChangeText={(text) => handleChange('estado', text)}
          />
          
          <Text style={styles.inputLabel}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Observações adicionais..."
            value={formData.observacoes}
            onChangeText={(text) => handleChange('observacoes', text)}
          />

        </ScrollView>
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={handleCloseModal} style={[styles.button, styles.buttonSecondary]}>
            <Text style={styles.buttonTextSecondary}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.button, styles.buttonPrimary, !formData.nome && styles.buttonDisabled]}
            disabled={!formData.nome}
          >
            <Text style={styles.buttonTextPrimary}>
              {editando ? 'Atualizar' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  // --- Fim Modal ---


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cadastro de Pacientes</Text>
          <Text style={styles.subtitle}>
            Cadastros auxiliares para facilitar os lançamentos
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novo Paciente</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert message={error} severity="error" onClose={() => setError('')} />
      <CustomAlert message={success} severity="success" onClose={() => setSuccess('')} />

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome ou CPF/CNPJ..."
          value={pesquisa}
          onChangeText={setPesquisa}
        />
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerText, { flex: 3 }]}>Nome</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>CPF/CNPJ</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1.5 }]}>Tipo</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Status</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1, textAlign: 'right' }]}>Ações</Text>
        </View>
        
        <ScrollView style={styles.tableBody}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
          ) : pacientesFiltrados.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum paciente encontrado</Text>
          ) : (
            pacientesFiltrados.map((paciente) => (
              <View key={paciente.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{paciente.nome}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{paciente.cpfCnpj || '-'}</Text>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Chip
                    label={paciente.tipoPessoa}
                    color={paciente.tipoPessoa === 'PF' ? 'primary' : 'secondary'}
                  />
                </View>
                {/* Contato removido da tabela para simplicidade na tela pequena */}
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Chip
                    label={paciente.ativo ? 'Ativo' : 'Inativo'}
                    color={paciente.ativo ? 'success' : 'default'}
                  />
                </View>
                <View style={[styles.tableCell, styles.actionsCell, { flex: 1 }]}>
                  <TouchableOpacity onPress={() => handleOpenModal(paciente)} style={styles.actionButton}>
                    <Icon name="edit" size={16} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(paciente.id)} style={[styles.actionButton, { marginLeft: 5 }]}>
                    <Icon name="delete" size={16} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {modalOpen && <ModalCadastro />}
    </View>
  );
};

// --- Estilos React Native ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2', // Primary color
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // Alertas
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#d32f2f', // Cor de erro
    borderRadius: 4,
    marginBottom: 10,
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#2e7d32', // Cor de sucesso
    borderRadius: 4,
    marginBottom: 10,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertText: {
    color: '#fff',
    flex: 1,
  },
  alertClose: {
    padding: 5,
  },
  // Pesquisa
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  // Tabela (Simulação)
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 12,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
  },
  loadingIndicator: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  // Chip
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chipPrimary: {
    backgroundColor: '#90caf9', // Azul claro
  },
  chipSuccess: {
    backgroundColor: '#a5d6a7', // Verde claro
  },
  chipText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
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
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  buttonTextSecondary: {
    color: '#333',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default Pacientes;