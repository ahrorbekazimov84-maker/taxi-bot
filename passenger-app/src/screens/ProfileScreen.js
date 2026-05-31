import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('passenger_data').then(d => { if (d) setUser(JSON.parse(d)); });
  }, []);

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Ha, chiqish', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={s.name}>{user?.name || 'Foydalanuvchi'}</Text>
        <Text style={s.phone}>{user?.phone}</Text>
        <View style={s.ratingBox}>
          <Text style={s.ratingText}>⭐ {parseFloat(user?.rating || 5).toFixed(1)}</Text>
          <Text style={s.ratingLabel}>Reyting</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        {[
          { val: user?.total_trips || 0, lbl: 'Jami triplar' },
          { val: parseFloat(user?.rating || 5).toFixed(1), lbl: 'Reyting' },
        ].map(item => (
          <View key={item.lbl} style={s.statBox}>
            <Text style={s.statVal}>{item.val}</Text>
            <Text style={s.statLbl}>{item.lbl}</Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Hisob ma'lumotlari</Text>
        {[
          ['📱 Telefon', user?.phone || '—'],
          ['✉️ Email', user?.email || 'Kiritilmagan'],
          ['📅 Ro\'yxat sanasi', user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—'],
        ].map(([k, v]) => (
          <View key={k} style={s.infoRow}>
            <Text style={s.infoKey}>{k}</Text>
            <Text style={s.infoVal}>{v}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Hisobdan chiqish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fa' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: '#fff', paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '800', color: '#1a1a2e' },
  phone: { fontSize: 14, color: '#636e72', marginTop: 4 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#fef3c7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  ratingText: { color: '#92400e', fontWeight: '700', fontSize: 14 },
  ratingLabel: { color: '#92400e', fontSize: 12 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', padding: 18, borderRightWidth: 1, borderRightColor: '#f3f4f6' },
  statVal: { color: '#1a1a2e', fontSize: 22, fontWeight: '700' },
  statLbl: { color: '#636e72', fontSize: 12, marginTop: 4 },
  section: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 4, marginBottom: 16 },
  sectionTitle: { color: '#636e72', fontSize: 11, fontWeight: '700', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  infoKey: { color: '#636e72', fontSize: 14 },
  infoVal: { color: '#1a1a2e', fontSize: 14, fontWeight: '500', maxWidth: 200, textAlign: 'right' },
  logoutBtn: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  logoutText: { color: '#e17055', fontWeight: '700', fontSize: 15 },
});
