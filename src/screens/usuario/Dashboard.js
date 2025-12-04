import api from '../../services/api';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Exemplo de ícones
// Certifique-se de que os paths estão corretos no seu projeto
// import { useAuth } from '../../context/AuthContext'; 

// --- 1. Componente de Item de Lista de Dados (Reutilizável) ---
const DataListItem = ({ label, value, showBorder = false, valueColor = '#333', valueWeight = 'bold' }) => (
    <View style={[styles.listItem, showBorder && styles.listItemBorder]}>
        <Text style={styles.listLabel}>{label}</Text>
        <Text style={[styles.listValue, { color: valueColor, fontWeight: valueWeight }]}>{value}</Text>
    </View>
);

import { useAuth } from '../../context/AuthContext';

// --- 3. Funções de Formatação e Cálculo ---

const formatarMoeda = (valor) => {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
// --- 4. Componente Principal do Dashboard ---
export default function Dashboard() {
    const screenWidth = Dimensions.get('window').width;
    const { user } = useAuth();
    const [metricas, setMetricas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cardsExpandidos, setCardsExpandidos] = useState({
        resultado: true,
        impostos: true,
        // Adicione outros cards aqui
    });
    console.log('[Dashboard] Usuário logado:', user);
    
    const mesAtual = 12; // Exemplo fixo, adapte para seu seletor de mês
    const anoAtual = 2025; // Exemplo fixo
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const navigation = useNavigation();

    const toggleCardExpansao = (cardId) => {
        setCardsExpandidos(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const calcularValores = () => {
        if (!metricas) return { receitas: 0, despesas: 0, resultado: 0 };
        console.log('[Dashboard] Métricas para cálculo:', metricas);
        const receitas = parseFloat(metricas.pessoaFisica?.rendimentos || 0) +
            parseFloat(metricas.pessoaJuridica?.faturamento || 0);
        const despesas = parseFloat(metricas.pessoaFisica?.pagamentos || 0) + 
                         parseFloat(metricas.despesas || 0); // Usando a métrica 'despesas' do primeiro bloco para o total
        const resultado = receitas - despesas;
        console.log('[Dashboard] Valores calculados:', { receitas, despesas, resultado });
        return { receitas, despesas, resultado };
    };
    
    const { receitas, despesas, resultado } = calcularValores();
    
    useEffect(() => {
        async function fetchMetricas() {
            try {
                console.log('[Dashboard] Buscando métricas:', `/api/dashboard/metricas?mes=${mesAtual}&ano=${anoAtual}`);
                const response = await api.get(`/api/dashboard/metricas?mes=${mesAtual}&ano=${anoAtual}`);
                console.log('[Dashboard] Resposta da API:', response);
                if (response && response.data) {
                    setMetricas(response.data);
                    console.log('[Dashboard] Métricas recebidas:', response.data);
                } else {
                    setMetricas(response);
                    console.log('[Dashboard] Métricas recebidas:', response);
                }
            } catch (err) {
                console.log('[Dashboard] Erro ao buscar métricas:', err);
                setError('Erro ao carregar dados do usuário');
            } finally {
                setLoading(false);
            }
        }
        fetchMetricas();
    }, [user, mesAtual, anoAtual]);
    

    // --- Renderização de Carregamento ---
    if (loading) {
        return <ActivityIndicator style={styles.loading} size="large" color="#1976d2" />;
    }

    // --- Componente de Card Reutilizável com Toggle ---
    const DashboardCard = ({ title, cardId, children }) => (
        <Card style={styles.card}>
            <TouchableOpacity 
                style={styles.cardHeader} 
                onPress={() => toggleCardExpansao(cardId)}
                activeOpacity={0.8}
            >
                <View style={styles.cardTitleContainer}>
                    <Icon 
                        name="drag-indicator" 
                        size={18} 
                        color="#ccc" 
                        style={styles.dragIcon}
                    />
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <Icon 
                    name={cardsExpandidos[cardId] ? "expand-less" : "expand-more"} 
                    size={24} 
                    color="#6c757d"
                />
            </TouchableOpacity>
            
            {cardsExpandidos[cardId] && (
                <View style={styles.cardContent}>
                    {children}
                </View>
            )}
        </Card>
    );

    // --- Conteúdo Específico dos Cards ---
    const RenderResultadoDoMes = () => (
        <>
            {/* O Gráfico de Barras precisa ser implementado com uma biblioteca como react-native-chart-kit */}
            <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>[Placeholder: Gráfico de Receitas vs Despesas]</Text>
            </View>
            <View style={[styles.resultadoBox, { backgroundColor: '#e9ecef' }]}>
                <Text style={styles.resultadoCaption}>Resultado Líquido</Text>
                <Text style={[
                    styles.resultadoValue, 
                    { color: resultado >= 0 ? '#00B389' : '#FF4873' }
                ]}>
                    {formatarMoeda(resultado)}
                </Text>
            </View>
        </>
    );

    const RenderImpostos = () => (
        <>
            {/* --- CARNÊ-LEÃO (PF) --- */}
            {(user?.tipoPessoa === 'PF' || user?.tipoPessoa === 'HIBRIDO') && (
                <View style={styles.impostosSection}>
                    <Text style={styles.impostosSubtitle}>Carnê-Leão (PF)</Text>
                    <DataListItem
                        label="Rendimentos (PF)"
                        value={formatarMoeda(metricas?.pessoaFisica?.rendimentos)}
                        valueColor="#00B389"
                        valueWeight="700"
                    />
                    <DataListItem
                        label="Despesas Dedutíveis"
                        value={formatarMoeda(metricas?.pessoaFisica?.pagamentos)}
                    />
                    <DataListItem
                        label="DNZ (Despesa p/ Zerar DARF)"
                        value={formatarMoeda(metricas?.pessoaFisica?.dnz)}
                    />
                    <DataListItem
                        label="DARF a Pagar"
                        value={formatarMoeda(metricas?.pessoaFisica?.darf)}
                        showBorder
                        valueColor="#FF4873"
                        valueWeight="700"
                    />
                </View>
            )}

            {/* --- SIMPLES NACIONAL (PJ) --- */}
            {(user?.tipoPessoa === 'PJ' || user?.tipoPessoa === 'HIBRIDO') && (
                <View style={[styles.impostosSection, user?.tipoPessoa === 'HIBRIDO' && { marginTop: 16 }]}>
                    <Text style={styles.impostosSubtitle}>Simples Nacional (PJ)</Text>
                    <DataListItem
                        label="Faturamento (PJ)"
                        value={formatarMoeda(metricas?.pessoaJuridica?.faturamento)}
                        valueColor="#00B389"
                        valueWeight="700"
                    />
                    <DataListItem
                        label="RBT12 (Receita 12 meses)"
                        value={formatarMoeda(metricas?.pessoaJuridica?.rbt12)}
                        valueColor="#ffffffff"
                        valueWeight="500"
                    />
                    <DataListItem
                        label="Alíquota Efetiva"
                        value={`${metricas?.pessoaJuridica?.aliquotaEfetiva}%`}
                        valueColor="#ffffffff"
                        valueWeight="500"
                    />
                    <DataListItem
                        label="DAS a Pagar"
                        value={formatarMoeda(metricas?.pessoaJuridica?.das)}
                        showBorder
                        valueColor="#FF4873"
                        valueWeight="700"
                    />
                </View>
            )}
        </>
    );

    const RenderDespesas = () => {
        const despesasData = metricas?.despesasIndividuais || [];
        const totalDespesas = despesasData.reduce((acc, despesa) => acc + parseFloat(despesa.value || 0), 0);
        return (
            <>
                <PieChart
                    data={despesasData.map((despesa, idx) => ({
                        name: despesa.name,
                        population: despesa.value,
                        color: ['#3f51b5', '#f50057', '#00B389', '#FF4873', '#FFC107', '#009688'][idx % 6],
                        legendFontColor: '#333',
                        legendFontSize: 12
                    }))}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
                <View style={styles.list}>
                    {despesasData.map((despesa, idx) => {
                        const percent = totalDespesas > 0 ? Math.round((parseFloat(despesa.value || 0) / totalDespesas) * 100) : 0;
                        return (
                            <DataListItem
                                key={despesa.name}
                                label={`${despesa.name} (${percent}%)`}
                                value={`-R$ ${parseFloat(despesa.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                showBorder
                            />
                        );
                    })}
                    <DataListItem
                        label="Total"
                        value={`-R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        valueColor="#FF4873"
                        valueWeight="700"
                    />
                </View>
            </>
        );
    };


    // --- Renderização Principal ---
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Visão Geral</Text>
                <Text style={styles.periodo}>
                    Período: <Text style={styles.bold}>{meses[mesAtual - 1]}/{anoAtual}</Text>
                </Text>
            </View>

            {/* Card: Resultado do Mês */}
            <DashboardCard title="Resultado do Mês" cardId="resultado">
                <RenderResultadoDoMes />
            </DashboardCard>

            {/* Card: Impostos */}
            <DashboardCard title="Impostos" cardId="impostos">
                <RenderImpostos />
            </DashboardCard>

            {/* Card: Despesas por Categoria (Gráfico) */}
            <DashboardCard title="Despesas por Categoria" cardId="despesas">
                <RenderDespesas />
            </DashboardCard>

            {/* Adicione outros cards conforme necessário, como receitas, lançamentos, plano de contas, etc. */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#1f1f1fff', 
        padding: 16 
    },
    loading: { 
        marginTop: 40 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#1976d2' 
    },
    periodo: {
        fontSize: 14,
        color: '#6c757d',
    },
    bold: {
        fontWeight: 'bold',
    },
    error: { 
        color: 'red', 
        textAlign: 'center', 
        marginBottom: 8 
    },
    card: { 
        marginBottom: 20, 
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dragIcon: {
        marginRight: 4,
        // O drag and drop nativo não funciona no RN. O ícone é apenas visual aqui.
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#333' 
    },
    cardContent: {
        padding: 16,
    },
    // Estilos do DataListItem (já existiam, apenas ajustados)
    listItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 8 
    },
    listItemBorder: { 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    listLabel: { 
        fontSize: 16, 
        color: '#555' 
    },
    listValue: { 
        fontSize: 16, 
    },
    list: {
        // Estilo para o container da lista de despesas/receitas
        paddingTop: 8,
    },
    // Estilos Resultado do Mês
    chartPlaceholder: {
        height: 150,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        marginBottom: 16,
    },
    chartText: {
        color: '#999',
        fontSize: 14,
    },
    resultadoBox: {
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resultadoCaption: {
        fontSize: 12,
        color: '#6c757d',
    },
    resultadoValue: {
        fontSize: 32,
        fontWeight: '700',
    },
    // Estilos Impostos
    impostosSection: {
        marginBottom: 8,
    },
    impostosSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6c757d',
        marginBottom: 8,
    },
});