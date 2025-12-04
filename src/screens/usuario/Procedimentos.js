/**
 * Página de Cadastro de Procedimentos (React Native)
 * Tela auxiliar para pré-cadastro de procedimentos (NÃO aparece no menu)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert as RNAlert, // Usaremos o Alert padrão do RN para confirmação de exclusão
  Platform, // Para ajustes específicos de plataforma, se necessário
} from 'react-native';
// Componentes do React Native Paper (Material Design)
import {
  Text,
  Button,
  TextInput,
  DataTable,
  Appbar,
  FAB,
  Chip,
  Dialog,
  Portal,
  useTheme, // Para acessar o tema e cores
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importação de ícones

// Importação do serviço (presumindo que o caminho '.../../services/procedimentoService' seja válido no RN)
import procedimentoService from '../../services/procedimentoService';

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Cor de fundo semelhante ao Paper/Box
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'white', // Fundo branco para o cabeçalho
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  alert: {
    margin: 16,
    padding: 10,
    borderRadius: 4,
    // Estilos para simular Alert (MUI) com base em cor
  },
  successAlert: {
    backgroundColor: '#d4edda', // Verde claro
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  errorAlert: {
    backgroundColor: '#f8d7da', // Vermelho claro
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  alertText: {
    color: '#155724', // Cor do texto verde escuro (success)
  },
  tableContainer: {
    margin: 16,
    borderRadius: 4,
    overflow: 'hidden', // Para manter as bordas arredondadas da tabela
    elevation: 2, // Sombra
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  // Estilos do Modal/Dialog
  dialogContent: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  inputSpacing: {
    marginBottom: 16, // Espaçamento entre os TextInputs
  },
});

// --- COMPONENTE PRINCIPAL ---
const Procedimentos = () => {
  const theme = useTheme();
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    valorPadrao: '',
    categoria: '',
    observacoes: '',
    ativo: true
  });

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  const carregarProcedimentos = async () => {
    try {
      setLoading(true);
      console.log('🔵 Carregando procedimentos...');
      // Usando uma chamada de serviço simulada ou real
      const data = await procedimentoService.listar(); 
      setProcedimentos(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar procedimentos');
      console.error('❌ Erro ao carregar:', err);
      setProcedimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (procedimento = null) => {
    if (procedimento) {
      setEditando(procedimento);
      setFormData({
        ...procedimento,
        // Garante que o valorPadrao é uma string para o TextInput
        valorPadrao: procedimento.valorPadrao ? String(procedimento.valorPadrao) : ''
      });
    } else {
      setEditando(null);
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        valorPadrao: '',
        categoria: '',
        observacoes: '',
        ativo: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  // Função para lidar com a mudança nos TextInputs
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Converte valorPadrao de volta para float (ou null se vazio)
      const valorNumerico = formData.valorPadrao ? parseFloat(formData.valorPadrao.replace(',', '.')) : null;

      if (isNaN(valorNumerico) && formData.valorPadrao) {
        throw new Error("Valor Padrão inválido.");
      }

      const dados = {
        ...formData,
        valorPadrao: valorNumerico,
      };

      if (editando) {
        await procedimentoService.atualizar(editando.id, dados);
        setSuccess('Procedimento atualizado com sucesso!');
      } else {
        await procedimentoService.criar(dados);
        setSuccess('Procedimento cadastrado com sucesso!');
      }

      handleCloseModal();
      carregarProcedimentos();

      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Erro ao salvar procedimento: ' + (err.message || ''));
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    RNAlert.alert(
      'Confirmação',
      'Deseja realmente excluir este procedimento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              await procedimentoService.deletar(id);
              setSuccess('Procedimento excluído com sucesso!');
              carregarProcedimentos();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError('Erro ao excluir procedimento');
              console.error(err);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const procedimentosFiltrados = (procedimentos || []).filter(p =>
    p.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(pesquisa.toLowerCase())) ||
    (p.categoria && p.categoria.toLowerCase().includes(pesquisa.toLowerCase()))
  );

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined) return '-';
    // Garante a formatação no padrão brasileiro R$ X.XXX,XX
    return `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View style={styles.container}>
      {/* Appbar para um título e potencial menu (Opcional no fluxo atual) */}
      <Appbar.Header>
        <Appbar.Content title="Cadastro de Procedimentos" />
      </Appbar.Header>

      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>
          Cadastro de Procedimentos
        </Text>
        <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.outline }}>
          Cadastros auxiliares para facilitar os lançamentos
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Mensagens de Alerta */}
        {error && (
          <View style={[styles.alert, styles.errorAlert]}>
            <Text style={{ color: theme.colors.error }} onPress={() => setError('')}>
              {error} (Toque para fechar)
            </Text>
          </View>
        )}
        {success && (
          <View style={[styles.alert, styles.successAlert]}>
            <Text style={{ color: theme.colors.onSurfaceVariant }} onPress={() => setSuccess('')}>
              {success} (Toque para fechar)
            </Text>
          </View>
        )}

        {/* Campo de Pesquisa */}
        <TextInput
          mode="outlined"
          style={styles.searchBar}
          label="Pesquisar"
          placeholder="Pesquisar por nome, código ou categoria..."
          value={pesquisa}
          onChangeText={setPesquisa}
          left={<TextInput.Icon icon="magnify" />}
        />

        {/* Tabela de Dados (usando DataTable do Paper) */}
        <View style={styles.tableContainer}>
          <DataTable>
            {/* Cabeçalho da Tabela */}
            <DataTable.Header>
              <DataTable.Title style={{ flex: 1.5 }}>Nome</DataTable.Title>
              <DataTable.Title style={{ flex: 1 }}>Categoria</DataTable.Title>
              <DataTable.Title numeric style={{ flex: 1.2 }}>Valor</DataTable.Title>
              <DataTable.Title style={{ flex: 1 }} numeric>Ações</DataTable.Title>
            </DataTable.Header>

            {loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator animating={true} color={theme.colors.primary} />
                <Text>Carregando...</Text>
              </View>
            ) : procedimentosFiltrados.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>Nenhum procedimento encontrado</Text>
              </View>
            ) : (
              // Corpo da Tabela
              procedimentosFiltrados.map((p) => (
                <DataTable.Row key={p.id}>
                  <DataTable.Cell style={{ flex: 1.5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{p.nome}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{p.codigo || '-'}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    {p.categoria ? <Chip compact>{p.categoria}</Chip> : '-'}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1.2 }}>
                    {formatarMoeda(p.valorPadrao)}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      {/* Ícone de Editar */}
                      <Button
                        icon={() => <Icon name="edit" size={18} color={theme.colors.primary} />}
                        onPress={() => handleOpenModal(p)}
                        compact
                        mode="text"
                      />
                      {/* Ícone de Excluir */}
                      <Button
                        icon={() => <Icon name="delete" size={18} color={theme.colors.error} />}
                        onPress={() => handleDelete(p.id)}
                        compact
                        mode="text"
                      />
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            )}
          </DataTable>
        </View>

        {/* Espaçamento final para o FAB não cobrir o conteúdo */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB para Novo Procedimento (Substitui o botão de adicionar no header) */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => handleOpenModal()}
      />

      {/* Modal de Cadastro/Edição (Usando Portal e Dialog do Paper) */}
      <Portal>
        <Dialog visible={modalOpen} onDismiss={handleCloseModal}>
          <Dialog.Title>
            {editando ? 'Editar Procedimento' : 'Novo Procedimento'}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <ScrollView>
              {/* Código */}
              <TextInput
                mode="outlined"
                label="Código"
                placeholder="Ex: TUSS 81000030"
                value={formData.codigo}
                onChangeText={(text) => handleChange('codigo', text)}
                style={styles.inputSpacing}
              />
              {/* Nome */}
              <TextInput
                mode="outlined"
                label="Nome *"
                placeholder="Ex: Restauração de dente"
                value={formData.nome}
                onChangeText={(text) => handleChange('nome', text)}
                style={styles.inputSpacing}
              />
              {/* Categoria */}
              <TextInput
                mode="outlined"
                label="Categoria"
                placeholder="Ex: Prevenção, Restauração"
                value={formData.categoria}
                onChangeText={(text) => handleChange('categoria', text)}
                style={styles.inputSpacing}
              />
              {/* Valor Padrão */}
              <TextInput
                mode="outlined"
                label="Valor Padrão"
                keyboardType="numeric"
                value={formData.valorPadrao}
                onChangeText={(text) => handleChange('valorPadrao', text)}
                style={styles.inputSpacing}
                left={<TextInput.Affix text="R$" />}
              />
              {/* Descrição */}
              <TextInput
                mode="outlined"
                label="Descrição"
                placeholder="Descreva os detalhes do procedimento..."
                value={formData.descricao}
                onChangeText={(text) => handleChange('descricao', text)}
                style={styles.inputSpacing}
                multiline
                numberOfLines={3}
              />
              {/* Observações */}
              <TextInput
                mode="outlined"
                label="Observações"
                value={formData.observacoes}
                onChangeText={(text) => handleChange('observacoes', text)}
                multiline
                numberOfLines={2}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseModal} mode="text">
              Cancelar
            </Button>
            <Button
              onPress={handleSubmit}
              mode="contained"
              disabled={!formData.nome}
            >
              {editando ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Procedimentos;

// Nota sobre a estrutura:
// Este componente precisaria ser envolvido por um <PaperProvider> e um <Icon.Provider> (dependendo da instalação do Icon) no componente raiz (App.js) do seu projeto React Native.