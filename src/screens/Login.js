
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text, Divider, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    console.log('[Login] Iniciando login...');
    if (!email || !senha) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }
    try {
      console.log('[Login] Chamando login() do contexto...');
      const result = await login(email, senha);
      console.log('[Login] Resultado do login:', result);
      if (result.success) {
        console.log('[Login] Login bem-sucedido! Redirecionando...');
        if (result.user?.isAdmin) {
          navigation.navigate('AdminDashboard');
        } else {
          navigation.navigate('Dashboard');
        }
      } else {
        console.log('[Login] Erro no login:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.log('[Login] Erro inesperado:', err);
      setError('Erro inesperado ao fazer login');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.paper}>
        <Text variant="headlineMedium" style={styles.title}>Gerencie</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sistema de Gestão Tributária para Dentistas
        </Text>
        {error ? (
          <HelperText type="error" visible={true} style={styles.error}>
            {error}
          </HelperText>
        ) : null}
        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Entrar
        </Button>
        <Divider style={styles.divider} />
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Cadastro')}
        >
          Criar nova conta
        </Button>
        <Text style={styles.demo}>
          Use: demo@exemplo.com / senha123 para testar
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  paper: { margin: 16, padding: 24, borderRadius: 12, backgroundColor: '#fff', elevation: 3 },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 16, color: '#888' },
  input: { marginBottom: 12 },
  button: { marginVertical: 12 },
  divider: { marginVertical: 12 },
  error: { textAlign: 'center', marginBottom: 8 },
  demo: { textAlign: 'center', marginTop: 16, color: '#888' },
});

export default Login;
