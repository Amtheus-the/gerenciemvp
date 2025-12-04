  const carregarProcedimentos = async () => {
    try {
      const data = await procedimentoService.listar();
      setProcedimentos(data || []);
      console.log('Procedimentos carregados:', data);
    } catch (err) {
      console.error('Erro ao carregar procedimentos:', err);
    }
  };
/**
 * Página de Faturamento - Versão Mínima em React Native
 * Gerencia receitas e faturamentos da clínica
 */
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  Platform, // Para data input
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Componente Select/Dropdown
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ícones

import { useAuth } from '../../context/AuthContext';
import { listarFaturamento, criarFaturamento, atualizarFaturamento, deletarFaturamento, emitirNotaFiscal } from '../../services/faturamentoService';
import pacienteService from '../../services/pacienteService';
import procedimentoService from '../../services/procedimentoService';

// --- UTILS (Mantendo a lógica de formatação) ---
const formatarData = (data) => new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
const formatarMoeda = (valor) => parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarCPF = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
};
const formatarValorInput = (valor) => (parseInt(valor.replace(/\D/g, '')) / 100).toFixed(2);


// --- COMPONENTE PRINCIPAL ---
const Faturamento = () => {
  const { user } = useAuth();
  const tipoUsuario = user?.tipoPessoa || 'PF';
  const isHibrido = String(tipoUsuario).toUpperCase() === 'HIBRIDO';

  const [faturamentos, setFaturamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  
  // ATENÇÃO: Autocomplete do MUI foi substituído por TextInput normal no RN simples
  const [pacientes, setPacientes] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [pagadorBeneficiario, setPagadorBeneficiario] = useState(true);

  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    paciente: '',
    cpf: '',
    formaPagamento: '',
    tipoPessoa: isHibrido ? '' : tipoUsuario,
    observacoes: '',
    pagadorNome: '',
    pagadorCpf: '',
    pagadorTipoPessoa: 'PF',
  });

  const [pesquisa, setPesquisa] = useState('');

  const formasPagamento = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência', 'Cheque', 'Outros'];
  const meses = [{ valor: 1, nome: 'Janeiro' }, { valor: 2, nome: 'Fevereiro' }, { valor: 3, nome: 'Março' }, { valor: 4, nome: 'Abril' }, { valor: 5, nome: 'Maio' }, { valor: 6, nome: 'Junho' }, { valor: 7, nome: 'Julho' }, { valor: 8, nome: 'Agosto' }, { valor: 9, nome: 'Setembro' }, { valor: 10, nome: 'Outubro' }, { valor: 11, nome: 'Novembro' }, { valor: 12, nome: 'Dezembro' }];
  const anos = [2023, 2024, 2025, 2026];
  
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());


  useEffect(() => {
    carregarDados();
    carregarPacientes();
    carregarProcedimentos();
  }, []);

  // Funções duplicadas removidas. Mantida apenas uma versão correta.

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await listarFaturamento();
      setFaturamentos(response.data || []);
    } catch (err) {
      setError('Erro ao carregar faturamentos');
    } finally {
      setLoading(false);
    }
  };

  const carregarPacientes = async () => {
    try {
      const data = await pacienteService.listar();
      setPacientes(data.filter(p => p.ativo) || []);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    }
  const abrirModalNovo = () => {
    carregarPacientes();
    carregarProcedimentos();
    setTimeout(() => {
      console.log('Pacientes no modal:', pacientes);
      console.log('Procedimentos no modal:', procedimentos);
    }, 1000);
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      paciente: '',
      cpf: '',
      formaPagamento: '',
      tipoPessoa: isHibrido ? '' : tipoUsuario,
      observacoes: '',
      pagadorNome: '',
      pagadorCpf: '',
      pagadorTipoPessoa: 'PF',
    });
    setOpenModal(true);
  };

  const abrirModalEdicao = (item) => {
    setModoEdicao(true);
    setItemEdicao(item);
    
    const temPagadorDiferente = item.pagadorNome && item.pagadorNome !== '';
        // Funções duplicadas removidas. Mantida apenas a versão que usa o serviço real.
    setPagadorBeneficiario(!temPagadorDiferente);
    
    setFormData({
      descricao: item.descricao || '',
      valor: item.valor ? parseFloat(item.valor).toFixed(2) : '', // RN usa string para input
      data: item.data || '',
      paciente: item.paciente || '',
      cpf: item.cpf || '',
      formaPagamento: item.formaPagamento || '',
      tipoPessoa: item.tipoPessoa || 'PF',
      observacoes: item.observacoes || '',
      pagadorNome: item.pagadorNome || '',
      pagadorCpf: item.pagadorCpf || '',
      pagadorTipoPessoa: item.pagadorTipoPessoa || 'PF',
    });
    setOpenModal(true);
  };

  const fecharModal = () => {
    setOpenModal(false);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      let tipoPessoaFinal = formData.tipoPessoa;
      if (!isHibrido) {
        tipoPessoaFinal = tipoUsuario;
      }

      const dados = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data: formData.data,
        paciente: formData.paciente,
        cpf: formData.cpf,
        formaPagamento: formData.formaPagamento,
        tipoPessoa: tipoPessoaFinal,
        observacoes: formData.observacoes,
        pagadorNome: pagadorBeneficiario ? '' : formData.pagadorNome,
        pagadorCpf: pagadorBeneficiario ? '' : formData.pagadorCpf,
        pagadorTipoPessoa: pagadorBeneficiario ? null : formData.pagadorTipoPessoa
      };

      if (modoEdicao) {
        await atualizarFaturamento(itemEdicao.id, dados);
        setSuccess('Faturamento atualizado!');
      } else {
        await criarFaturamento(dados);
        setSuccess('Faturamento criado!');
      }

      fecharModal();
      carregarDados();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este faturamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              setLoading(true);
              await deletarFaturamento(id);
              setSuccess('Faturamento excluído!');
              carregarDados();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError('Erro ao excluir');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  // --- Lógica de Filtro (Mantida) ---
  const faturamentosFiltrados = faturamentos.filter(f => {
    const dataFaturamento = new Date(f.data + 'T00:00:00');
    const passaMesAno = dataFaturamento.getMonth() + 1 === mesFiltro && dataFaturamento.getFullYear() === anoFiltro;
    
    if (pesquisa) {
      const termoPesquisa = pesquisa.toLowerCase();
      const nomeMatch = f.paciente?.toLowerCase().includes(termoPesquisa);
      const cpfMatch = f.cpf?.replace(/\D/g, '').includes(termoPesquisa.replace(/\D/g, ''));
      return passaMesAno && (nomeMatch || cpfMatch);
    }
    
    return passaMesAno;
  });

  // --- Cálculos (Mantidos) ---
  const totalFaturamentoFiltrado = faturamentosFiltrados.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
  const impostosPFFiltrado = faturamentosFiltrados.filter(f => f.tipoPessoa === 'PF').reduce((acc, item) => acc + parseFloat(item.valor || 0), 0) * 0.275;
  const impostosPJFiltrado = faturamentosFiltrados.filter(f => f.tipoPessoa === 'PJ').reduce((acc, item) => acc + parseFloat(item.valor || 0), 0) * 0.15;
  const totalImpostosFiltrado = impostosPFFiltrado + impostosPJFiltrado;
  const lucroLiquidoFiltrado = totalFaturamentoFiltrado - totalImpostosFiltrado;
  const notasEmitidasFiltradas = faturamentosFiltrados.filter(f => f.notaEmitida).length;
  const notasPendentesFiltradas = faturamentosFiltrados.filter(f => f.tipoPessoa === 'PJ' && !f.notaEmitida).length;

  // Renderiza um item da lista
  const renderItem = ({ item: faturamento }) => (
    <View style={styles.listItem}>
      {/* Data */}
      <View style={{ width: 45, alignItems: 'center' }}>
        <Text style={styles.dataDia}>{new Date(faturamento.data + 'T00:00:00').getDate().toString().padStart(2, '0')}</Text>
        <Text style={styles.dataMes}>{new Date(faturamento.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: '2-digit' })}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.nomePaciente}>{faturamento.paciente}</Text>
          <View style={[styles.chip, { backgroundColor: '#e0e0e0', marginLeft: 5 }]}>
            <Text style={styles.chipText}>{faturamento.tipoPessoa}</Text>
          </View>
        </View>
        <Text style={styles.descricao}>{faturamento.descricao}</Text>
      </View>

      {/* Valor e Status */}
      <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
        <Text style={styles.valor}>{formatarMoeda(faturamento.valor)}</Text>
        <View style={[styles.chip, faturamento.notaEmitida ? styles.chipSuccess : styles.chipWarning]}>
          <Text style={styles.chipText}>{faturamento.notaEmitida ? 'Emitida' : 'Pendente'}</Text>
        </View>
      </View>

      {/* Ações (Simplificado - apenas Editar e Deletar) */}
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <TouchableOpacity onPress={() => abrirModalEdicao(faturamento)}>
          <Icon name="edit" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletar(faturamento.id)}>
          <Icon name="delete" size={20} color="#dc3545" />
        </TouchableOpacity>
        {/* Ação de NF/Recibo (simulada) */}
        <TouchableOpacity onPress={() => Alert.alert('Ação Nota/Recibo', `Simular modal para ${faturamento.notaEmitida ? 'Baixar/Enviar' : 'Emitir'}`)}>
          <Icon name={faturamento.notaEmitida ? "file-download" : "description"} size={20} color={faturamento.notaEmitida ? "#28a745" : "#6c757d"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Mensagens de Alerta */}
      {error && <View style={[styles.alert, styles.alertError]}><Text style={styles.alertText}>{error}</Text></View>}
      {success && <View style={[styles.alert, styles.alertSuccess]}><Text style={styles.alertText}>{success}</Text></View>}

      {/* PAINEL LATERAL ESQUERDO (Adaptado para topo/filtros) */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Faturamento</Text>
        
        {/* Filtro de Mês/Ano - Dropdowns (Pickers) */}
        <View style={styles.filterRow}>
            {/* Filtro Mês */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Mês</Text>
              <Picker
                selectedValue={mesFiltro}
                onValueChange={(itemValue) => setMesFiltro(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                {meses.map(mes => (
                  <Picker.Item key={mes.valor} label={mes.nome} value={mes.valor} />
                ))}
              </Picker>
            </View>
            {/* Filtro Ano */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Ano</Text>
              <Picker
                selectedValue={anoFiltro}
                onValueChange={(itemValue) => setAnoFiltro(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                {anos.map(ano => (
                  <Picker.Item key={ano} label={String(ano)} value={ano} />
                ))}
              </Picker>
            </View>
        </View>
        
        {/* Barra de Pesquisa */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Pesquisar por paciente ou CPF..."
          value={pesquisa}
          onChangeText={setPesquisa}
        />

        {/* Totais (Exibição simplificada em uma linha) */}
        <View style={styles.totalsRow}>
            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Bruto</Text>
                <Text style={styles.totalValueGreen}>{formatarMoeda(totalFaturamentoFiltrado)}</Text>
            </View>
            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Líquido</Text>
                <Text style={styles.totalValueBlue}>{formatarMoeda(lucroLiquidoFiltrado)}</Text>
            </View>
            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Impostos</Text>
                <Text style={styles.totalValueOrange}>{formatarMoeda(totalImpostosFiltrado)}</Text>
            </View>
        </View>

        {/* Botão Novo Lançamento */}
        <TouchableOpacity style={styles.addButton} onPress={abrirModalNovo}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novo Lançamento</Text>
        </TouchableOpacity>
        
      </View>

      {/* ÁREA PRINCIPAL - LISTA */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
        ) : faturamentos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum faturamento cadastrado</Text>
            <TouchableOpacity style={styles.addButtonOutlined} onPress={abrirModalNovo}>
              <Icon name="add" size={18} color="#007bff" />
              <Text style={styles.addButtonOutlinedText}>Adicionar primeiro lançamento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={faturamentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data))}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      {/* MODAL CRIAR/EDITAR */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={openModal}
        onRequestClose={fecharModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                    {modoEdicao ? 'Editar Receita' : 'Nova Receita'}
                </Text>
                <TouchableOpacity onPress={fecharModal}>
                    <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Mensagens de Erro no Modal */}
              {error && <View style={[styles.alert, styles.alertError]}><Text style={styles.alertText}>{error}</Text></View>}

              {/* Formulário - Campos */}
              
              {/* Valor e Data */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                    <Text style={styles.label}>Valor *</Text>
                    <View style={styles.inputWithAdornment}>
                        <Text style={styles.adornmentText}>R$</Text>
                        <TextInput
                            style={[styles.input, styles.valueInput]}
                            keyboardType="numeric"
                            value={formData.valor}
                            onChangeText={(text) => {
                                const valorDigitado = text.replace(/\D/g, '');
                                const valorFormatado = formatarValorInput(valorDigitado);
                                setFormData({ ...formData, valor: valorFormatado });
                            }}
                            placeholder="0.00"
                            maxLength={10}
                        />
                    </View>
                </View>
                <View style={styles.inputGroupHalf}>
                    <Text style={styles.label}>Data *</Text>
                    {/* ATENÇÃO: Input Date no RN é complexo. Usando TextInput simples com o formato YYYY-MM-DD para compatibilidade */}
                    <TextInput
                        style={styles.input}
                        value={formData.data}
                        onChangeText={(text) => setFormData({ ...formData, data: text })}
                        placeholder="AAAA-MM-DD"
                    />
                </View>
              </View>

              {/* Procedimento */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Procedimento *</Text>
                <Picker
                  selectedValue={formData.descricao}
                  onValueChange={(itemValue) => setFormData({ ...formData, descricao: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                >
                  <Picker.Item label="Selecione..." value="" />
                  {procedimentos.map(proc => (
                    <Picker.Item key={proc.id} label={proc.nome || proc.descricao} value={proc.nome || proc.descricao} />
                  ))}
                </Picker>
                <TouchableOpacity onPress={() => console.log('Simular cadastro de procedimento')} style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>Cadastrar Procedimento</Text>
                </TouchableOpacity>
              </View>

              {/* Paciente */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Paciente *</Text>
                <Picker
                  selectedValue={formData.paciente}
                  onValueChange={(itemValue) => setFormData({ ...formData, paciente: itemValue })}
                  style={styles.picker}
                  mode="dropdown"
                >
                  <Picker.Item label="Selecione..." value="" />
                  {pacientes.map(pac => (
                    <Picker.Item key={pac.id} label={pac.nome} value={pac.nome} />
                  ))}
                </Picker>
                <TouchableOpacity onPress={() => console.log('Simular cadastro de paciente')} style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>Cadastrar Paciente</Text>
                </TouchableOpacity>
              </View>
              
              {/* CPF e Tipo Pessoa (simplificado) */}
              <View style={styles.row}>
                <View style={styles.inputGroupHalf}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={formatarCPF(formData.cpf)}
                        onChangeText={(text) => setFormData({ ...formData, cpf: formatarCPF(text) })}
                        placeholder="000.000.000-00"
                    />
                </View>
                {isHibrido && (
                  <View style={styles.pickerContainerHalf}>
                      <Text style={styles.pickerLabel}>Tipo Pessoa</Text>
                      <Picker
                          selectedValue={formData.tipoPessoa}
                          onValueChange={(itemValue) => setFormData({ ...formData, tipoPessoa: itemValue })}
                          style={styles.picker}
                          mode="dropdown"
                      >
                          <Picker.Item label="Pessoa Física (PF)" value="PF" />
                          <Picker.Item label="Pessoa Jurídica (PJ)" value="PJ" />
                      </Picker>
                  </View>
                )}
              </View>

              {/* Forma de Pagamento */}
              <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Forma de Pagamento *</Text>
                  <Picker
                      selectedValue={formData.formaPagamento}
                      onValueChange={(itemValue) => setFormData({ ...formData, formaPagamento: itemValue })}
                      style={styles.picker}
                      mode="dropdown"
                  >
                      <Picker.Item label="Selecione..." value="" />
                      {formasPagamento.map(forma => (
                          <Picker.Item key={forma} label={forma} value={forma} />
                      ))}
                  </Picker>
              </View>

              {/* Pagador Beneficiário Checkbox */}
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setPagadorBeneficiario(!pagadorBeneficiario)}
              >
                <View style={[styles.checkbox, pagadorBeneficiario && styles.checkboxChecked]}>
                  {pagadorBeneficiario && <Icon name="check" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>O pagador é o próprio paciente (beneficiário)</Text>
              </TouchableOpacity>

              {/* Dados do Pagador (se for diferente) */}
              {!pagadorBeneficiario && (
                <View style={styles.pagadorContainer}>
                    <Text style={styles.pagadorTitle}>Dados do Pagador (Terceiro)</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome do Pagador *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.pagadorNome}
                            onChangeText={(text) => setFormData({ ...formData, pagadorNome: text })}
                            placeholder="Nome Completo / Razão Social"
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <View style={styles.inputGroupHalf}>
                            <Text style={styles.label}>CPF/CNPJ do Pagador *</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.pagadorCpf}
                                onChangeText={(text) => setFormData({ ...formData, pagadorCpf: text })}
                                placeholder="CPF ou CNPJ"
                            />
                        </View>
                        <View style={styles.pickerContainerHalf}>
                            <Text style={styles.pickerLabel}>Tipo Pessoa Pagador</Text>
                            <Picker
                                selectedValue={formData.pagadorTipoPessoa}
                                onValueChange={(itemValue) => setFormData({ ...formData, pagadorTipoPessoa: itemValue })}
                                style={styles.picker}
                                mode="dropdown"
                            >
                                <Picker.Item label="Pessoa Física (PF)" value="PF" />
                                <Picker.Item label="Pessoa Jurídica (PJ)" value="PJ" />
                            </Picker>
                        </View>
                    </View>
                </View>
              )}
              
              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={formData.observacoes}
                    onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                    placeholder="Informações adicionais para o lançamento"
                    multiline
                    numberOfLines={3}
                />
              </View>

            </ScrollView>

            {/* Ações do Modal */}
            <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={fecharModal}>
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.modalButton, styles.modalSaveButton]} 
                    onPress={handleSubmit} 
                    disabled={loading || formData.valor === '' || parseFloat(formData.valor) <= 0 || formData.descricao === '' || formData.paciente === ''}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : 
                        <Text style={styles.modalSaveButtonText}>
                            {modoEdicao ? 'Salvar Edição' : 'Salvar Lançamento'}
                        </Text>
                    }
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- ESTILOS DO REACT NATIVE ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  // --- Header/Filtros/Totais ---
  headerContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  pickerContainerHalf: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    position: 'absolute',
    top: -8,
    left: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  totalBox: {
    alignItems: 'center',
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  totalValueGreen: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  totalValueBlue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  totalValueOrange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffc107',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  // --- Lista de Faturamentos ---
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  flatListContent: {
    paddingVertical: 0, // Remover padding aqui e manter no item
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  dataDia: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dataMes: {
    fontSize: 12,
    color: '#6c757d',
  },
  nomePaciente: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  descricao: {
    fontSize: 12,
    color: '#6c757d',
  },
  valor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#28a745',
  },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  chipSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  chipWarning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    height: 300, 
  },
  emptyText: {
    color: '#6c757d',
    marginBottom: 10,
  },
  addButtonOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonOutlinedText: {
    color: '#007bff',
    marginLeft: 5,
    fontWeight: '500',
  },
  // --- Modal ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    elevation: 5,
    maxHeight: '90%',
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
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalCancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: '#007bff',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // --- Formulário ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputGroupHalf: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputWithAdornment: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingLeft: 10,
  },
  adornmentText: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 5,
  },
  valueInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoButton: {
    marginTop: 5,
    alignSelf: 'flex-start',
    padding: 5,
  },
  infoButtonText: {
    color: '#007bff',
    fontSize: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  pagadorContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
    paddingLeft: 10,
    marginBottom: 15,
  },
  pagadorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  // Alertas
  alert: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  alertError: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  alertText: {
    fontSize: 14,
  },
});

export default Faturamento;