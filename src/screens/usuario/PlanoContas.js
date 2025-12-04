/**
 * Página de Plano de Contas - Design Minimalista (React Native)
 * Cadastro simples de naturezas de despesas (dedutíveis e não dedutíveis)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
// Componentes do React Native Paper (Material Design para RN)
import {
  Paper,
  TextInput,
  Button,
  IconButton,
  Dialog,
  Portal,
  HelperText,
  Checkbox,
  ActivityIndicator,
  // Para ícones
  MD2Icons,
} from 'react-native-paper';
// Componentes para Abas (Tabs)
import { TabView, SceneMap } from 'react-native-tab-view';
import * as Linking from 'expo-linking'; // Exemplo para simular window.confirm

// SIMULAÇÃO DOS SERVIÇOS (Deve ser implementado o acesso real à API)
// Assumindo que estes serviços agora usam 'fetch' ou 'axios' padrão do RN/JS
const planoContasService = {
  listar: async (tipo) => {
    // Simulação: Retorna dados mockados (você deve substituir pela chamada real à API)
    return [
      { id: '1', codigo: 'C100', nome: 'Aluguel do Escritório', tipo: tipo, dedutivel: true, ativo: true },
      { id: '2', codigo: 'C101', nome: 'Marketing Digital', tipo: tipo, dedutivel: true, ativo: true },
      { id: '3', codigo: 'C200', nome: 'Multa de Trânsito', tipo: tipo, dedutivel: false, ativo: true },
      { id: '4', codigo: 'C102', nome: 'Conta de Água', tipo: tipo, dedutivel: true, ativo: true },
    ];
  },
  criar: async (dados) => { /* Chama API POST */ console.log('Criando:', dados); },
  atualizar: async (id, dados) => { /* Chama API PUT */ console.log('Atualizando:', id, dados); },
  deletar: async (id) => { /* Chama API DELETE */ console.log('Deletando:', id); },
};

const chatService = {
  consultarDedutibilidade: async (pergunta) => {
    // Simulação: Resposta da IA (você deve substituir pela chamada real à API)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          resposta: `A despesa "${pergunta}" é **geralmente dedutível** para profissionais liberais, desde que esteja relacionada com a atividade-fim. Por exemplo, a conta de água do consultório é dedutível, mas a da sua residência não é. Consulte sempre um contador!`,
        });
      }, 1500);
    });
  },
};
// FIM DA SIMULAÇÃO DE SERVIÇOS

const PlanoContas = () => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tab states (para react-native-tab-view)
  const [index, setIndex] = useState(0); // 0 = Dedutíveis, 1 = Não Dedutíveis
  const [routes] = useState([
    { key: 'dedutivel', title: 'Dedutíveis' },
    { key: 'naoDedutivel', title: 'Não Dedutíveis' },
  ]);
  
  // Form states
  const [nome, setNome] = useState('');
  const [dedutivel, setDedutivel] = useState(true);
  const [editando, setEditando] = useState(null);

  // Modal IA
  const [openModalIA, setOpenModalIA] = useState(false);
  const [perguntaIA, setPerguntaIA] = useState('');
  const [respostaIA, setRespostaIA] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    carregarContas();
  }, []);

  // --- Funções de Lógica ---

  const carregarContas = async () => {
    try {
      setLoading(true);
      console.log('🔵 Carregando plano de contas...');
      const data = await planoContasService.listar('despesa'); // Só despesas
      console.log('✅ Contas recebidas:', data);
      setContas(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar contas');
      console.error('❌ Erro:', err);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionar = async () => {
    if (!nome.trim()) {
      setError('Digite o nome da natureza');
      return;
    }

    try {
      setLoading(true);
      const dados = {
        // No RN, usar um código automático ou o ID retornado pela API
        codigo: Date.now().toString(), 
        nome: nome.trim(),
        tipo: 'despesa',
        dedutivel: dedutivel,
        categoria: dedutivel ? 'Dedutível' : 'Não Dedutível',
        ativo: true
      };

      if (editando) {
        await planoContasService.atualizar(editando.id, dados);
        setSuccess('Natureza atualizada!');
      } else {
        await planoContasService.criar(dados);
        setSuccess('Natureza adicionada!');
      }

      // Limpar form
      setNome('');
      setEditando(null);
      setDedutivel(true);
      
      carregarContas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // É mais difícil acessar `err.response?.data?.message` em RN sem axios
      setError('Erro ao salvar: ' + (err.message || 'Desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (conta) => {
    setEditando(conta);
    setNome(conta.nome);
    setDedutivel(conta.dedutivel);
    // Muda para aba correspondente
    setIndex(conta.dedutivel ? 0 : 1);
  };

  const handleCancelarEdicao = () => {
    setEditando(null);
    setNome('');
    setDedutivel(true);
    // Limpa o erro ao cancelar a edição
    setError(''); 
  };

  const handleDeletar = async (id) => {
    // Substituindo window.confirm por Alert
    Alert.alert(
      "Confirmação",
      "Deseja realmente excluir esta natureza?",
      [
        {
          text: "Não",
          style: "cancel"
        },
        { 
          text: "Sim", 
          onPress: async () => {
            try {
              await planoContasService.deletar(id);
              setSuccess('Natureza excluída!');
              carregarContas();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError('Erro ao excluir');
            }
          }
        }
      ]
    );
  };

  const handleConsultarIA = async () => {
    if (!perguntaIA.trim()) {
      Alert.alert('Atenção', 'Digite sua dúvida antes de consultar.');
      return;
    }

    try {
      setLoadingIA(true);
      setRespostaIA('');
      setError('');
      
      console.log('🤖 Consultando IA sobre:', perguntaIA);
      
      const data = await chatService.consultarDedutibilidade(perguntaIA);

      console.log('✅ Resposta da IA recebida');
      setRespostaIA(data.resposta);
      
    } catch (err) {
      console.error('❌ Erro ao consultar IA:', err);
      const errorMessage = err.message || 'Erro ao consultar IA. Verifique sua conexão.';
      setError(errorMessage);
    } finally {
      setLoadingIA(false);
    }
  };

  const contasDedutiveis = (contas || []).filter(c => c.dedutivel);
  const contasNaoDedutiveis = (contas || []).filter(c => !c.dedutivel);
  
  // --- Componentes das Abas ---

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCellName}>{item.nome}</Text>
      <View style={styles.tableCellActions}>
        <IconButton
          icon="pencil"
          size={18}
          onPress={() => handleEditar(item)}
          // color={styles.primaryText.color} // Em RN Paper, a cor é definida pelo theme ou prop
        />
        <IconButton
          icon="delete"
          size={18}
          onPress={() => handleDeletar(item.id)}
          // color={styles.errorText.color}
          style={{marginLeft: 4}}
        />
      </View>
    </View>
  );

  const renderContent = (contasExibidas) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      );
    }

    if (contasExibidas.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma natureza cadastrada
          </Text>
        </View>
      );
    }

    // Tabela/Lista Simples
    return (
      <View>
        {/* Cabeçalho da Tabela */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCellName, styles.tableHeaderText]}>Nome</Text>
          <Text style={styles.tableHeaderText}>Ações</Text>
        </View>
        {/* Itens da Tabela */}
        {contasExibidas.map(item => (
          <Paper key={item.id} style={styles.tableRowContainer}>
            {renderItem({ item })}
          </Paper>
        ))}
      </View>
    );
  };
  
  const DedutivelRoute = () => (
    <View style={styles.tabContent}>
      {renderContent(contasDedutiveis)}
    </View>
  );
  
  const NaoDedutivelRoute = () => (
    <View style={styles.tabContent}>
      {renderContent(contasNaoDedutiveis)}
    </View>
  );

  const renderScene = SceneMap({
    dedutivel: DedutivelRoute,
    naoDedutivel: NaoDedutivelRoute,
  });

  const renderTabBar = props => {
    // Usando o componente padrão do TabView para o TabBar
    const backgroundColor = 'white'; // Defina sua cor de fundo
    const indicatorStyle = { backgroundColor: '#6200EE' }; // Cor do indicador
    const labelStyle = { fontWeight: 'bold' };
    const tabStyle = { width: 'auto', flex: 1 }; // Distribui as abas
    
    return (
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        {props.navigationState.routes.map((route, i) => {
          const isFocused = props.navigationState.index === i;
          const label = route.title + ` (${i === 0 ? contasDedutiveis.length : contasNaoDedutiveis.length})`;
          
          return (
            <TouchableOpacity
              key={route.key}
              style={{ flex: 1, padding: 10, alignItems: 'center', borderBottomWidth: isFocused ? 2 : 0, borderBottomColor: isFocused ? '#6200EE' : 'transparent' }}
              onPress={() => setIndex(i)}
            >
              <Text style={{ fontWeight: isFocused ? 'bold' : 'normal', color: isFocused ? '#6200EE' : '#555' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  // --- Renderização Principal ---

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plano de Contas</Text>
        <Text style={styles.headerSubtitle}>
          Cadastre as naturezas de despesas para classificação fiscal
        </Text>
      </View>

      {/* Alertas */}
      {error && (
        <Paper style={[styles.alert, styles.alertError]}>
          <Text style={styles.alertText}>{error}</Text>
          <IconButton icon="close" size={16} onPress={() => setError('')} />
        </Paper>
      )}
      {success && (
        <Paper style={[styles.alert, styles.alertSuccess]}>
          <Text style={styles.alertText}>{success}</Text>
          <IconButton icon="close" size={16} onPress={() => setSuccess('')} />
        </Paper>
      )}

      {/* Formulário Inline */}
      <Paper style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {editando ? 'Editar Natureza' : 'Nova Natureza'}
        </Text>
        
        <TextInput
          label="Nome da Natureza"
          placeholder="Ex: Água, Aluguel, Marketing"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          style={styles.textInput}
          onSubmitEditing={handleAdicionar} // Dispara ao pressionar "Enter" no teclado
          disabled={loading}
        />

        <View style={styles.checkboxContainer}>
          <Checkbox
            status={dedutivel ? 'checked' : 'unchecked'}
            onPress={() => setDedutivel(!dedutivel)}
            color="#4CAF50" // Cor de sucesso
          />
          <Text style={styles.checkboxLabel}>Dedutível</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            mode="contained"
            icon={editando ? 'pencil' : 'plus'}
            onPress={handleAdicionar}
            disabled={loading || !nome.trim()}
            style={styles.actionButton}
            labelStyle={styles.actionButtonText}
          >
            {editando ? 'Atualizar' : 'Adicionar'}
          </Button>

          {editando && (
            <Button
              mode="outlined"
              onPress={handleCancelarEdicao}
              style={styles.actionButton}
            >
              Cancelar
            </Button>
          )}

          <Button
            mode="outlined"
            icon="robot"
            onPress={() => setOpenModalIA(true)}
            compact
            style={styles.iaButton}
            color="#9C27B0" // Cor secundária
          >
            Consultar IA
          </Button>
        </View>
      </Paper>

      {/* Abas e Tabela */}
      <Paper style={styles.tabsContainer}>
        {/* TabView substitui Tabs/Tab do MUI */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Linking.getInitialURL() ? Linking.getInitialURL().width : 300 }} // Simulação de width
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />
      </Paper>

      {/* Modal Consultar IA */}
      <Portal>
        <Dialog 
          visible={openModalIA} 
          onDismiss={() => {
            setOpenModalIA(false);
            setPerguntaIA('');
            setRespostaIA('');
          }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogHeader}>
            <View style={styles.dialogTitleContent}>
              <MD2Icons name="robot" color="#9C27B0" size={24} />
              <Text style={styles.dialogTitleText}>Consultar Assistente Fiscal</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Qual despesa você tem dúvida se é dedutível?"
              placeholder="Ex: Conta de água do consultório"
              value={perguntaIA}
              onChangeText={setPerguntaIA}
              multiline
              numberOfLines={2}
              mode="outlined"
              style={styles.textInput}
              disabled={loadingIA}
            />

            {loadingIA && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="small" />
                <Text style={styles.loadingText}>
                  Consultando assistente fiscal...
                </Text>
              </View>
            )}

            {respostaIA && !loadingIA && (
              <Paper style={styles.iaResponseContainer}>
                <Text style={styles.iaResponseText}>
                  {respostaIA}
                </Text>
              </Paper>
            )}
            
            {error && !loadingIA && (
              <HelperText type="error" visible={true} style={{marginTop: 8}}>
                {error}
              </HelperText>
            )}

          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setOpenModalIA(false);
                setPerguntaIA('');
                setRespostaIA('');
              }}
            >
              Fechar
            </Button>
            <Button 
              mode="contained"
              onPress={handleConsultarIA}
              disabled={loadingIA || !perguntaIA.trim()}
            >
              {loadingIA ? 'Consultando...' : 'Consultar'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // Cor de fundo semelhante ao MUI Box
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alert: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  alertError: {
    backgroundColor: '#f443361a', // vermelho claro
    borderColor: '#f44336',
    borderLeftWidth: 4,
  },
  alertSuccess: {
    backgroundColor: '#4caf501a', // verde claro
    borderColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  alertText: {
    color: '#333',
    flex: 1,
  },
  formContainer: {
    padding: 16,
    marginBottom: 16,
    elevation: 2, // Sombra do Paper
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    marginBottom: 12,
    backgroundColor: 'white',
    // Não precisa de minWidth como no web
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 8,
  },
  actionButtonText: {
    // Para ajuste fino se necessário
  },
  iaButton: {
    marginLeft: 'auto', // Empurra para a direita no flexbox
  },
  tabsContainer: {
    elevation: 2,
    minHeight: 300, // Altura mínima para o TabView funcionar
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  // Estilos da Tabela (simulação com View/Text)
  tableRowContainer: {
    marginBottom: 1, // Pequeno espaçamento entre as linhas se for Paper
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
  },
  tableCellName: {
    flex: 1, // Permite que o nome ocupe mais espaço
    fontSize: 14,
  },
  tableCellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80, // Largura fixa para as ações
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
  },
  // Estilos do Diálogo (Modal IA)
  dialog: {
    // Estilo para o modal no RN Paper
  },
  dialogHeader: {
    // Estilo para o DialogTitle
  },
  dialogTitleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iaResponseContainer: {
    padding: 12,
    marginTop: 12,
    backgroundColor: '#fafafa', // Cor de fundo para resposta
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  iaResponseText: {
    fontSize: 14,
    // whiteSpace: 'pre-line' é simulado pela quebra de linha normal do Text
  },
});

export default PlanoContas;