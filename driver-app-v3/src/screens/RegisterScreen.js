import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { driverAuthAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation, onLogin }) {
  const [form, setForm] = useState({ phone: '', name: '', password: '', car_model: '', car_number: '', car_color: '', license_number: '', region: 'Toshkent' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.phone || !form.name || !form.password) return Alert.alert('Xato', 'Majburiy maydonlarni to\'ldiring');
    setLoading(true);
    try {
      const res = await driverAuthAPI.register(form);
      await AsyncStorage.setItem('driver_data', JSON.stringify(res.data.driver));
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Ro\'yxatdan o\'tishda xato');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'To\'liq ism *', placeholder: 'Alisher Karimov', keyboard: 'default' },
    { key: 'phone', label: 'Telefon *', placeholder: '+998901234567', keyboard: 'phone-pad' },
    { key: 'password', label: 'Parol *', placeholder: '••••••••', secure: true },
    { key: 'car_model', label: 'Mashina modeli', placeholder: 'Chevrolet Malibu', keyboard: 'default' },
    { key: 'car_number', label: 'Davlat raqami', placeholder: '01A123BB', keyboard: 'default' },
    { key: 'car_color', label: 'Rang', placeholder: 'Oq', keyboard: 'default' },
    { key: 'license_number', label: 'Haydovchilik guvohnomasi', placeholder: 'AA1234567', keyboard: 'default' },
    { key: 'region', label: 'Viloyat', placeholder: 'Toshkent', keyboard: 'default' },
  ];

  return (
    <ScrollView style={{ backgroundColor: '#1a1a2e' }} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <Text style={s.emoji}>🚗</Text>
        <Text style={s.title}>Ro'yxatdan o'tish</Text>
        <Text style={s.subtitle}>Haydovchi sifatida ro'yxatdan o'ting</Text>
      </View>

      <View style={s.form}>
        {fields.map(f => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor="#9ca3af"
              value={form[f.key]} onChangeText={v => set(f.key, v)}
              keyboardType={f.keyboard || 'default'} secureTextEntry={f.secure} />
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
  container: { paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#9ca3af' },
  form: { backgroundColor: '#252542', borderRadius: 20, padding: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#d1d5db', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, fontSize: 14, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  btn: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 14 },
  linkText: { color: '#6c5ce7', fontSize: 14 },
});
