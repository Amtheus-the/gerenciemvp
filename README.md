# Mobile - Sistema Gerencie

Aplicativo mobile React Native para sistema de gestão tributária voltado para dentistas.

## 🚀 Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes de UI
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Instalar Expo CLI globalmente (se não tiver)
npm install -g expo-cli
```

## 🏃 Execução

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou específico para cada plataforma
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## 📱 Telas do Aplicativo

### Pública
- **Login** - Autenticação de usuários

### Privadas (requer autenticação)
- **Dashboard** - Visão geral com métricas financeiras
- **Lançamentos** - Gerenciamento de despesas e faturamento
- **Relatórios** - Visualização de relatórios
- **Análise IA** - Recomendações tributárias com IA

## 🔐 Autenticação

A autenticação é gerenciada via JWT token, armazenado localmente usando AsyncStorage.

## 📂 Estrutura de Pastas

```
src/
├── context/         # Contextos React
│   └── AuthContext.js
├── routes/          # Configuração de navegação
│   └── index.js
├── screens/         # Telas do aplicativo
│   ├── LoadingScreen.js
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   ├── LancamentosScreen.js
│   ├── RelatoriosScreen.js
│   └── AnaliseScreen.js
├── services/        # Serviços de API
│   ├── api.js
│   ├── authService.js
│   ├── despesasService.js
│   └── faturamentoService.js
└── theme.js         # Tema customizado
```

## ⚙️ Configuração

Edite o arquivo `src/services/api.js` e altere a URL da API:

```javascript
const API_URL = 'http://SEU_IP:5000/api';
```

**Importante**: No Android, use o IP da sua máquina na rede local (não use localhost).

## 📝 Próximos Passos

- [ ] Implementar modais para criar/editar lançamentos
- [ ] Adicionar gráficos (react-native-chart-kit)
- [ ] Implementar pull-to-refresh
- [ ] Adicionar validações de formulário
- [ ] Implementar notificações push
- [ ] Adicionar modo offline
- [ ] Implementar testes
- [ ] Configurar build para produção

## 🔧 Build para Produção

```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 📱 Testando

- Use o aplicativo Expo Go no seu smartphone
- Escaneie o QR code que aparece após executar `npm start`
- Certifique-se de estar na mesma rede Wi-Fi
