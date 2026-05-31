import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { passengerAuthAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Xato', 'Barcha maydonlarni to\'ldiring');
    setLoading(true);
    try {
      const res = await passengerAuthAPI.login({ phone, password });
      await AsyncStorage.setItem('passenger_data', JSON.stringify(res.data.user));
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Kirishda xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <Text style={s.emoji}>🚕</Text>
        <Text style={s.title}>TaxiGo</Text>
        <Text style={s.subtitle}>O'zbekiston bo'ylab qulay taxi</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Kirish</Text>
        <Text style={s.label}>Telefon raqam</Text>
        <TextInput style={s.input} placeholder="+998901234567" placeholderTextColor="#9ca3af"
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={s.label}>Parol</Text>
        <TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#9ca3af"
          value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Kirish</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.linkBtn} onPress={() => navigation?.navigate('Register')}>
          <Text style={s.linkText}>Hisob yo'qmi? Ro'yxatdan o'ting →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f6fa', paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 36 },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#636e72', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7, marginTop: 4 },
  input: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 13, fontSize: 15, color: '#1a1a2e', marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  btn: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6c5ce7', fontSize: 14 },
});
