import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform // Para verificar a plataforma, se necessário
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

// --- Funções Auxiliares ---
// Função de formatação de data (simples, não usa @fullcalendar/core/formatDate)
const formatRNDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (e) {
        return dateString; // Retorna o original em caso de erro
    }
};

// --- Variáveis de Ambiente (Ajuste conforme sua configuração RN) ---
// Em um projeto React Native, as variáveis de ambiente são geralmente gerenciadas
// por outras bibliotecas (ex: react-native-config) ou um arquivo de configuração.
// Aqui, estou simulando o acesso:
const BASE_API_URL = "http://localhost:5000/api"; // Ajuste conforme seu RN
const API_URL = `${BASE_API_URL}/agendamentos`;
const API_PACIENTES = `${BASE_API_URL}/pacientes`;
const API_PROCEDIMENTOS = `${BASE_API_URL}/procedimentos`;

const Calendar = () => {
    const [currentEvents, setCurrentEvents] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        paciente_id: "",
        procedimento_id: "",
        data_hora: "", // Deve ser uma string de data/hora compatível com input/API
        duracao_minutos: 30,
        observacoes: ""
    });
    const [selectedDate, setSelectedDate] = useState(null); // Mantido por consistência, mas usado principalmente para o modal
    const [pacientes, setPacientes] = useState([]);
    const [procedimentos, setProcedimentos] = useState([]);
    const [token, setToken] = useState(null);

    // --- Hooks de Efeito e Carga de Dados ---
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Obter Token
            const storedToken = await AsyncStorage.getItem('token');
            setToken(storedToken);

            if (!storedToken) {
                Alert.alert("Erro", "Token de autenticação não encontrado.");
                return;
            }

            const headers = { Authorization: `Bearer ${storedToken}` };

            // 2. Buscar Agendamentos
            try {
                const res = await fetch(API_URL, { headers });
                const data = await res.json();
                if (Array.isArray(data)) {
                    const events = data.map(ag => ({
                        id: ag.id,
                        title: ag.status + (ag.observacoes ? ` - ${ag.observacoes}` : ""),
                        start: ag.data_hora, // Usado como start/data para o RN
                        allDay: false
                    }));
                    setCurrentEvents(events);
                } else {
                    console.error('API retornou um formato inesperado:', data);
                }
            } catch (err) {
                console.error('Erro ao buscar agendamentos:', err);
            }

            // 3. Buscar Pacientes
            try {
                const res = await fetch(API_PACIENTES, { headers });
                const data = await res.json();
                if (Array.isArray(data)) setPacientes(data);
            } catch (err) {
                console.error('Erro ao buscar pacientes:', err);
            }

            // 4. Buscar Procedimentos
            try {
                const res = await fetch(API_PROCEDIMENTOS, { headers });
                const data = await res.json();
                if (Array.isArray(data)) setProcedimentos(data);
            } catch (err) {
                console.error('Erro ao buscar procedimentos:', err);
            }
        };

        loadInitialData();
    }, []);

    // --- Handlers ---
    const handleDateClick = (dateString) => {
        // Simulação do click no calendário (abre o modal com a data pré-selecionada)
        setSelectedDate(dateString);
        setModalData({
            paciente_id: "",
            procedimento_id: "",
            data_hora: dateString,
            duracao_minutos: 30,
            observacoes: ""
        });
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleModalChange = (name, value) => {
        setModalData(prev => ({ ...prev, [name]: value }));
    };

    const handleModalSubmit = async () => {
        if (!token) {
            Alert.alert("Erro de Autenticação", "Token não disponível.");
            return;
        }

        // Recupera o usuário logado do AsyncStorage
        const userJSON = await AsyncStorage.getItem('user');
        const usuarioLogado = userJSON ? JSON.parse(userJSON) : {};

        const novoAgendamento = {
            clinica_id: usuarioLogado?.clinicaId || "1", // ajuste conforme necessário
            user_id: usuarioLogado?.id,
            paciente_id: modalData.paciente_id,
            procedimento_id: modalData.procedimento_id,
            data_hora: modalData.data_hora,
            duracao_minutos: modalData.duracao_minutos,
            status: "agendado",
            observacoes: modalData.observacoes
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(novoAgendamento)
            });

            if (res.ok) {
                const agendamentoSalvo = await res.json();
                // Adiciona o novo evento à lista
                setCurrentEvents(prev => ([
                    ...prev,
                    {
                        id: agendamentoSalvo.id,
                        title: agendamentoSalvo.status + (agendamentoSalvo.observacoes ? ` - ${agendamentoSalvo.observacoes}` : ""),
                        start: agendamentoSalvo.data_hora,
                        allDay: false
                    }
                ]));
                Alert.alert("Sucesso", "Agendamento salvo com sucesso!");
                setModalOpen(false);
            } else {
                Alert.alert("Erro", "Erro ao salvar agendamento!");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erro de Conexão", "Erro de conexão com o backend!");
        }
    };

    // Note: No React Native, a exclusão de eventos da lista é manual,
    // já que não há um FullCalendar para fazer o 'selected.event.remove()'.
    const handleEventClick = (event) => {
        Alert.alert(
            "Excluir Evento",
            `Tem certeza que quer excluir esse evento: '${event.title}'?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: () => {
                        // Lógica de exclusão na API e atualização do estado
                        setCurrentEvents(prev => prev.filter(e => e.id !== event.id));
                        // **TODO: Adicionar chamada de exclusão na API aqui**
                        Alert.alert("Excluído", "O evento foi excluído localmente. (Lembre-se de implementar a chamada na API)");
                    }
                }
            ]
        );
    };


    // --- Renderização do Componente ---
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Calendário</Text>
            <Text style={styles.subHeader}>Calendário interativo (Visualização de Lista em RN)</Text>

            <View style={styles.contentWrapper}>
                {/* SIMULAÇÃO DE BARRA LATERAL (Lista de Eventos) */}
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarHeader}>Próximos Agendamentos</Text>
                    <ScrollView>
                        {currentEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.listItem}
                                onPress={() => handleEventClick(event)}
                            >
                                <Text style={styles.listItemPrimary}>{event.title}</Text>
                                <Text style={styles.listItemSecondary}>
                                    {formatRNDate(event.start)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* SIMULAÇÃO DO CALENDÁRIO (Para um visual de calendário, use 'react-native-calendars') */}
                <View style={styles.calendarArea}>
                    <Text style={styles.infoText}>
                        **Placeholder de Calendário**
                    </Text>
                    <Text style={styles.infoText}>
                        Clique no botão abaixo para simular um agendamento rápido
                        na data atual, ou integre uma biblioteca de calendário (ex: `react-native-calendars`).
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleDateClick(new Date().toISOString())}
                    >
                        <Text style={styles.addButtonText}>Novo Agendamento</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal de Agendamento */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalOpen}
                onRequestClose={handleModalClose}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Novo Agendamento</Text>

                        {/* Picker de Paciente */}
                        <Text style={styles.label}>Paciente</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={modalData.paciente_id}
                                onValueChange={(itemValue) => handleModalChange("paciente_id", itemValue)}
                            >
                                <Picker.Item label="Selecione um paciente..." value="" />
                                {pacientes.map(p => (
                                    <Picker.Item key={p.id} label={p.nome} value={p.id.toString()} />
                                ))}
                            </Picker>
                        </View>

                        {/* Picker de Procedimento */}
                        <Text style={styles.label}>Procedimento</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={modalData.procedimento_id}
                                onValueChange={(itemValue) => handleModalChange("procedimento_id", itemValue)}
                            >
                                <Picker.Item label="Selecione um procedimento..." value="" />
                                {procedimentos.map(p => (
                                    <Picker.Item key={p.id} label={p.nome} value={p.id.toString()} />
                                ))}
                            </Picker>
                        </View>

                        {/* Campo Data e Hora (Usando TextInput simples, use '@react-native-community/datetimepicker' para melhor UX) */}
                        <Text style={styles.label}>Data e Hora (AAAA-MM-DDTHH:mm)</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => handleModalChange("data_hora", text)}
                            value={modalData.data_hora}
                            placeholder="Ex: 2025-12-03T16:00"
                        />

                        {/* Campo Duração */}
                        <Text style={styles.label}>Duração (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={(text) => handleModalChange("duracao_minutos", text)}
                            value={String(modalData.duracao_minutos)}
                            keyboardType="numeric"
                        />

                        {/* Campo Observações */}
                        <Text style={styles.label}>Observações</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            onChangeText={(text) => handleModalChange("observacoes", text)}
                            value={modalData.observacoes}
                            multiline
                            numberOfLines={2}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleModalClose}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleModalSubmit}>
                                <Text style={styles.buttonText}>Agendar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// --- Estilização (Substituindo MUI) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    contentWrapper: {
        flexDirection: 'row',
        flex: 1,
    },
    sidebar: {
        flex: 1,
        backgroundColor: '#f4f4f4', // Cor de fundo da barra lateral (simulando theme.palette.background.paper)
        padding: 15,
        borderRadius: 4,
        marginRight: 15,
    },
    sidebarHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    listItem: {
        backgroundColor: '#d0f0c0', // Cor de sucesso (simulando theme.palette.success.light)
        padding: 10,
        marginVertical: 5,
        borderRadius: 2,
    },
    listItemPrimary: {
        fontWeight: '600',
    },
    listItemSecondary: {
        fontSize: 12,
        color: '#333',
    },
    calendarArea: {
        flex: 4,
        marginLeft: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    infoText: {
        textAlign: 'center',
        marginVertical: 10,
        color: '#999',
    },
    addButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Estilos do Modal
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "stretch",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%', // Ajuste o tamanho conforme necessário
        maxWidth: 500,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 10,
        justifyContent: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    submitButton: {
        backgroundColor: '#1976d2', // Azul primário (simulando variant="contained")
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Calendar;