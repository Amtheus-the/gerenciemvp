/**
 * Configuração de rotas do aplicativo
 * Define navegação entre telas
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Importa telas
import Login from '../screens/Login';
import DashboardScreen from '../screens/usuario/Dashboard';
import LancamentosScreen from '../screens/usuario/Lancamentos';
import PlanoDeContasScreen from '../screens/usuario/PlanoDeContas';
import LoadingScreen from '../screens/usuario/LoadingScreen';
// Se não tiver LoadingScreen, crie um componente simples ou remova o import

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Navegação por abas (tabs) para usuários autenticados
 */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#757575',
        headerStyle: {
          backgroundColor: '#1976d2',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Lancamentos"
        component={LancamentosScreen}
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PlanoDeContas"
        component={PlanoDeContasScreen}
        options={{
          title: 'Plano de Contas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-table" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Componente principal de rotas
 */
export default function Routes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppTabs} />
      ) : (
  <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}
