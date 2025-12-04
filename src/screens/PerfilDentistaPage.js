import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import PerfilDentista from '../components/PerfilDentista';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function PerfilDentistaPage() {
  const { user } = useAuth();
  const [clinica, setClinica] = useState(null);

  useEffect(() => {
    async function fetchClinica() {
      if (user?.clinica_id) {
        try {
          const response = await api.get(`/clinicas/${user.clinica_id}`);
          setClinica(response);
        } catch (err) {
          setClinica(null);
        }
      }
    }
    fetchClinica();
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PerfilDentista dados={user} clinica={clinica} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
});

export default PerfilDentistaPage;
