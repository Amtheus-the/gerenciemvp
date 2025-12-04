import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity, // Usado para criar botões customizados (melhor que o Button nativo)
    ActivityIndicator, // Substitui CircularProgress
    Alert, // Para exibir mensagens de erro/informação
} from 'react-native';

// Você pode substituir este ícone por um de uma biblioteca como 'react-native-vector-icons'
// Exemplo de importação (Se você tivesse 'react-native-vector-icons'):
// import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * Página de Análise Tributária
 */
const Analise = () => {
    const [loading, setLoading] = useState(false);
    const [analise, setAnalise] = useState(null);
    const [error, setError] = useState('');

    /**
     * Solicita análise tributária
     */
    const handleAnalisar = async () => {
        setLoading(true);
        setError('');

        try {
            // TODO: Chamar API real
            // Simulação de resposta com um atraso de 2 segundos
            setTimeout(() => {
                setAnalise({
                    estruturaAtual: 'Pessoa Física',
                    estruturaRecomendada: 'Simples Nacional',
                    justificativa: `Com base no seu faturamento mensal médio de R$ 15.000,00 e despesas de R$ 6.000,00,
                        a abertura de um CNPJ no Simples Nacional é altamente recomendada. Esta estrutura permitirá uma
                        economia tributária significativa em comparação com a tributação como pessoa física.`,
                    economiaEstimada: 'R$ 2.500,00/mês',
                    acoesRecomendadas: [
                        'Abrir CNPJ como Simples Nacional',
                        'Contratar contador especializado',
                        'Regularizar emissão de notas fiscais',
                        'Organizar documentação contábil',
                    ],
                });
                setLoading(false);
            }, 2000); // 2 segundos de simulação de carregamento
        } catch (e) {
            setError('Erro ao se comunicar com a API de análise.');
            setLoading(false);
        }
    };

    // --- Componentes ---

    // Componente customizado para substituir o Divider do MUI
    const CustomDivider = () => <View style={styles.divider} />;

    // Componente customizado para substituir o Alert do MUI
    const CustomAlert = ({ severity, children }) => {
        const style = severity === 'error' ? styles.alertError : styles.alertInfo;
        return (
            <View style={[styles.alert, style]}>
                <Text style={styles.alertText}>{children}</Text>
            </View>
        );
    };

    // --- Renderização ---
    return (
        <ScrollView style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.title}>Análise Tributária com IA</Text>
                <Text style={styles.bodyText}>
                    Nossa IA analisa seus dados financeiros e recomenda a melhor estrutura jurídica
                    para minimizar sua carga tributária.
                </Text>

                {/* Botão de análise (Substituindo o Button/Box do MUI) */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleAnalisar}
                    disabled={loading}
                >
                    <View style={styles.buttonContent}>
                        {loading && <ActivityIndicator size="small" color="#fff" style={styles.icon} />}
                        {/* Se estiver usando react-native-vector-icons, você colocaria o Icon aqui:
                        {!loading && <Icon name="analytics" size={20} color="#fff" style={styles.icon} />} */}
                        <Text style={styles.buttonText}>
                            {loading ? 'Analisando...' : 'Solicitar Análise'}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Mensagem de erro */}
                {error ? (
                    <CustomAlert severity="error">
                        {error}
                    </CustomAlert>
                ) : null}

                {/* Resultado da análise (Substituindo Paper/Box do MUI) */}
                {analise && (
                    <View style={styles.paper}>
                        <Text style={styles.resultTitle}>
                            Resultado da Análise
                        </Text>

                        <CustomDivider />

                        <Text style={styles.sectionTitleSuccess}>
                            Estrutura Recomendada
                        </Text>
                        <Text style={styles.bodyText}>
                            <Text style={styles.bold}>{analise.estruturaRecomendada}</Text>
                        </Text>
                        
                        <CustomDivider />

                        <Text style={styles.bodyTextParagraph}>
                            {analise.justificativa}
                        </Text>

                        <CustomDivider />

                        <Text style={styles.sectionTitle}>
                            Economia Estimada
                        </Text>
                        <Text style={styles.economiaEstimada}>
                            {analise.economiaEstimada}
                        </Text>

                        <CustomDivider />

                        <Text style={styles.sectionTitle}>
                            Ações Recomendadas
                        </Text>
                        <View style={styles.list}>
                            {analise.acoesRecomendadas.map((acao, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.listItemBullet}>•</Text>
                                    <Text style={styles.bodyText}>{acao}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.alertContainer}>
                            <CustomAlert severity="info">
                                <Text style={styles.bold}>Importante:</Text> Esta análise é baseada em dados automatizados.
                                Consulte sempre um contador para validar as recomendações.
                            </CustomAlert>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

// --- Estilização (Substituindo as props do MUI) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Cor de fundo da tela
    },
    box: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    bodyTextParagraph: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
        marginTop: 16, // Espaço após o divisor
    },
    bold: {
        fontWeight: 'bold',
    },
    // Estilos do Botão
    button: {
        backgroundColor: '#1976d2', // Azul primário
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 4,
        alignSelf: 'flex-start', // Simula o Box mb={3}
        marginBottom: 24,
    },
    buttonDisabled: {
        backgroundColor: '#90caf9',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    icon: {
        marginRight: 8,
    },
    // Estilos do Alerta
    alert: {
        padding: 12,
        borderRadius: 4,
        marginBottom: 24,
    },
    alertError: {
        backgroundColor: '#f443361a', // Vermelho claro (simulando Alert severity="error")
        borderWidth: 1,
        borderColor: '#f44336',
    },
    alertInfo: {
        backgroundColor: '#2196f31a', // Azul claro (simulando Alert severity="info")
        borderWidth: 1,
        borderColor: '#2196f3',
    },
    alertText: {
        fontSize: 14,
        color: '#333',
    },
    alertContainer: {
        marginTop: 24, // Simula sx={{ mt: 3 }}
    },
    // Estilos do Resultado (Paper)
    paper: {
        backgroundColor: '#fff',
        padding: 16, // Simula sx={{ p: 3 }}
        borderRadius: 8,
        elevation: 2, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1976d2', // Cor primária
        marginBottom: 8,
    },
    // Estilos de Títulos Secundários
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionTitleSuccess: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4caf50', // Cor success.main
        marginBottom: 8,
    },
    // Estilos da Economia
    economiaEstimada: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4caf50', // Cor success.main
        marginBottom: 16,
    },
    // Estilos da Lista (Ações Recomendadas)
    list: {
        paddingLeft: 10, // Simula sx={{ pl: 2 }}
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    listItemBullet: {
        fontSize: 16,
        marginRight: 8,
        fontWeight: 'bold',
        lineHeight: 24, // Ajuste para alinhar com o texto
    },
    // Estilos do Divisor
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16, // Simula sx={{ my: 2 }}
    },
});

export default Analise;