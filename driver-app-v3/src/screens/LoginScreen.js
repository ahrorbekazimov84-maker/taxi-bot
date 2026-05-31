import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { driverAuthAPI } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Xato', 'Barcha maydonlarni to\'ldiring');
    setLoading(true);
    try {
      const res = await driverAuthAPI.login({ phone, password });
      await AsyncStorage.setItem('driver_data', JSON.stringify(res.data.driver));
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Kirishda xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <Text style={s.emoji}>🚕</Text>
        <Text style={s.title}>Haydovchi Panel</Text>
        <Text style={s.subtitle}>Hisobingizga kiring</Text>
      </View>

      <View style={s.form}>
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
  container: { flexGrow: 1, backgroundColor: '#1a1a2e', paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  form: { backgroundColor: '#252542', borderRadius: 20, padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#d1d5db', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 14, fontSize: 15, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  btn: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6c5ce7', fontSize: 14 },
});
