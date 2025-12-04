import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert as RNAlert, // Usado para feedback simples ou erros
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog,
  Menu,
  Switch, // Não usado no original, mas seria para o tipoPessoa se fosse um boolean
  TouchableRipple, // Para simular o Link
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Para ícones de senha
import api from '../services/api'; // O serviço de API deve funcionar

function Cadastro() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Para o Select
  const [formData, setFormData] = useState({
    nomeClinica: '',
    tipoPessoa: 'PF', // Começa com um valor padrão
    cnpj: '',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const tiposPessoa = {
    PF: 'Pessoa Física',
    PJ: 'Pessoa Jurídica (CNPJ)',
    HIBRIDO: 'Híbrido (PF + PJ)',
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'tipoPessoa' && value === 'PF') {
      setFormData(prev => ({
        ...prev,
        cnpj: ''
      }));
    }
    // Limpa erro ao digitar
    if (error) setError('');
  };

  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return cnpjLimpo.length === 14;
  };

  const formatarCNPJ = (value) => {
    const cnpj = value.replace(/[^\d]/g, '');
    // Esta é uma implementação de formatação de máscara. Funciona no RN.
    return cnpj
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleCNPJChange = (value) => {
    const formatted = formatarCNPJ(value);
    setFormData(prev => ({
      ...prev,
      cnpj: formatted
    }));
  };

  const validarFormulario = () => {
    if (!formData.nomeClinica) {
        setError('Por favor, informe o Nome da Clínica');
        return false;
    }

    if (!formData.tipoPessoa) {
      setError('Por favor, selecione o Tipo de Pessoa');
      return false;
    }

    if ((formData.tipoPessoa === 'PJ' || formData.tipoPessoa === 'HIBRIDO')) {
      if (!formData.cnpj) {
        setError('Por favor, informe o CNPJ');
        return false;
      }
      if (!validarCNPJ(formData.cnpj)) {
        setError('CNPJ inválido');
        return false;
      }
    }

    if (!formData.nome) {
      setError('Por favor, informe o nome do dentista');
      return false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    if (!formData.senha || formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  // Removido e.preventDefault pois não existe no Button do RN
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // DADOS ENVIADOS PARA API
      const payload = {
        nomeClinica: formData.nomeClinica,
        tipoPessoa: formData.tipoPessoa,
        cnpj: formData.cnpj.replace(/[^\d]/g, ''), // Remove formatação
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      };

      const response = await api.post('/auth/register', payload);

      setSuccess('Cadastro realizado com sucesso! Redirecionando...');

      // **ATENÇÃO:** Substituição do localStorage por um aviso/função de navegação do RN.
      // Em React Native, você usaria o AsyncStorage aqui.
      // Ex: await AsyncStorage.setItem('token', response.data.token);
      console.log('Token de resposta:', response.data.token);

      setTimeout(() => {
        // Redireciona para a tela 'Dashboard' usando React Navigation
        navigation.navigate('Dashboard');
      }, 1500);

    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      // Tratamento de erro mais robusto para RN
      setError(
        err.response?.data?.message || 
        'Erro ao realizar cadastro. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usa KeyboardAvoidingView para evitar que o teclado cubra os campos
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Simulação do fundo degradê e do Paper/Container */}
        <View style={styles.card}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Bem-vindo ao Gerencie
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Crie sua conta e transforme a gestão da sua clínica
            </Text>
          </View>

          {/* Mensagens de Feedback */}
          {(error || success) && (
            <HelperText 
              type={error ? 'error' : 'info'} 
              visible={true}
              style={{ 
                backgroundColor: error ? theme.colors.errorContainer : theme.colors.primaryContainer, 
                marginBottom: 16, 
                borderRadius: 4, 
                padding: 8 
              }}
            >
              <Text style={{ color: error ? theme.colors.onErrorContainer : theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>
                {error || success}
              </Text>
            </HelperText>
          )}

          {/* Campos do Formulário */}
          <TextInput
            mode="outlined"
            label="Nome da Clínica"
            value={formData.nomeClinica}
            onChangeText={(text) => handleChange('nomeClinica', text)}
            style={styles.input}
            placeholder="Ex: Clínica Odonto Plus"
            autoCapitalize="words"
          />

          {/* Tipo de Pessoa (Simulando o Select com Menu) */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableRipple 
                onPress={() => setMenuVisible(true)}
                style={styles.menuAnchor}
              >
                <TextInput
                  mode="outlined"
                  label="Tipo de Pessoa"
                  value={tiposPessoa[formData.tipoPessoa]}
                  editable={false}
                  right={<TextInput.Icon icon="chevron-down" />}
                  style={styles.input}
                />
              </TouchableRipple>
            }
            style={styles.menu}
          >
            {Object.keys(tiposPessoa).map((key) => (
              <Menu.Item
                key={key}
                onPress={() => {
                  handleChange('tipoPessoa', key);
                  setMenuVisible(false);
                }}
                title={tiposPessoa[key]}
              />
            ))}
          </Menu>

          {(formData.tipoPessoa === 'PJ' || formData.tipoPessoa === 'HIBRIDO') && (
            <TextInput
              mode="outlined"
              label="CNPJ"
              value={formData.cnpj}
              onChangeText={handleCNPJChange}
              style={styles.input}
              placeholder="00.000.000/0000-00"
              keyboardType="numeric"
              maxLength={18}
            />
          )}

          <TextInput
            mode="outlined"
            label="Nome do Dentista"
            value={formData.nome}
            onChangeText={(text) => handleChange('nome', text)}
            style={styles.input}
            placeholder="Seu nome completo"
            autoCapitalize="words"
          />

          <TextInput
            mode="outlined"
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu@email.com"
          />

          <TextInput
            mode="outlined"
            label="Senha"
            value={formData.senha}
            onChangeText={(text) => handleChange('senha', text)}
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholder="Mínimo 6 caracteres"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                forceLtr
              />
            }
          />

          <TextInput
            mode="outlined"
            label="Confirmar Senha"
            value={formData.confirmarSenha}
            onChangeText={(text) => handleChange('confirmarSenha', text)}
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholder="Digite a senha novamente"
          />

          {/* Botão de Cadastro */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Criando Conta...' : 'Criar Conta'}
          </Button>

          {/* Link para Login */}
          <View style={styles.loginLinkContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Já tem uma conta?{' '}
            </Text>
            <TouchableRipple onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Fazer Login
              </Text>
            </TouchableRipple>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- ESTILOS DO REACT NATIVE ---
const styles = StyleSheet.create({
  // Simulação do fundo degradê (O degradê real seria feito com Expo Linear Gradient ou similar)
  container: {
    flex: 1,
    backgroundColor: '#667eea', // Cor sólida como fallback
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  // Simulação do Paper/Container (fundo branco com sombra)
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 12,
    elevation: 20, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 500, // Limite de largura para tablets
    alignSelf: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#667eea', // Cor primária simulando o MUI
    textAlign: 'center',
  },
  subtitle: {
    color: '#757575', // textSecondary
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white', // Garante que o input seja branco no Paper
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
    // Em RN, o degradê no botão é mais complexo, mantive cor sólida com base no Paper/Theme.
    // Para degradê, usaria um componente de gradiente como wrapper.
  },
  buttonContent: {
    height: 56, // size="large" e py: 1.5 simulados
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para o Menu/Select
  menuAnchor: {
    marginBottom: 16,
  },
  menu: {
    width: '85%', // Ajuste conforme necessário
    // A posição do Menu é calculada automaticamente pelo Paper, mas pode precisar de ajuste fino.
  }
});

export default Cadastro;