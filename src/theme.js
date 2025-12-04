/**
 * Tema customizado do aplicativo
 * Define cores e estilos padrão
 */

import { DefaultTheme, MD2DarkTheme } from 'react-native-paper';
import { Appearance } from 'react-native';

const colorScheme = Appearance.getColorScheme();

const lightColors = {
  ...DefaultTheme.colors,
  primary: '#1976d2',
  accent: '#4caf50',
  background: '#f5f5f5',
  surface: '#ffffff',
  error: '#f44336',
  text: '#000000',
  onSurface: '#000000',
  disabled: '#9e9e9e',
  placeholder: '#757575',
};

const darkColors = {
  ...MD2DarkTheme.colors,
  primary: '#90caf9',
  accent: '#81c784',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#ef5350',
  text: '#e0e0e0',
  onSurface: '#e0e0e0',
  disabled: '#616161',
  placeholder: '#bdbdbd',
};

const theme = {
  ...(colorScheme === 'dark' ? MD2DarkTheme : DefaultTheme),
  colors: colorScheme === 'dark' ? darkColors : lightColors,
};

export default theme;
