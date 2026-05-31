import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { passengerAuthAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation, onLogin }) {
  const [form, setForm] = useState({ phone: '', name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.phone || !form.name || !form.password) return Alert.alert('Xato', 'Barcha maydonlarni to\'ldiring');
    if (form.password.length < 6) return Alert.alert('Xato', 'Parol kamida 6 ta belgi bo\'lishi kerak');
    setLoading(true);
    try {
      const res = await passengerAuthAPI.register(form);
      await AsyncStorage.setItem('passenger_data', JSON.stringify(res.data.user));
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Ro\'yxatdan o\'tishda xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.hero}>
        <Text style={s.emoji}>👋</Text>
        <Text style={s.title}>Ro'yxatdan o'ting</Text>
        <Text style={s.subtitle}>Bir marta, bepul va tez</Text>
      </View>

      <View style={s.card}>
        {[
          { key: 'name',     label: 'To\'liq ism *',    placeholder: 'Dilnoza Yusupova', keyboard: 'default' },
          { key: 'phone',    label: 'Telefon raqam *', placeholder: '+998901234567',    keyboard: 'phone-pad' },
          { key: 'password', label: 'Parol *',          placeholder: '••••••••',         secure: true },
        ].map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor="#9ca3af"
              value={form[f.key]} onChangeText={v => set(f.key, v)}
              keyboardType={f.keyboard} secureTextEntry={f.secure} />
          </View>
        ))}

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Ro'yxatdan o'tish</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.linkBtn} onPress={() => navigation?.goBack()}>
          <Text style={s.linkText}>← Kirish sahifasiga qaytish</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f6fa', paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a2e' },
  subtitle: { fontSize: 13, color: '#636e72', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7, marginTop: 4 },
  input: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 13, fontSize: 15, color: '#1a1a2e', marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  btn: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6c5ce7', fontSize: 14 },
});
