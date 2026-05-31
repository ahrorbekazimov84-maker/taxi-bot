import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { driverAPI } from '../utils/api';

export default function ProfileScreen({ onLogout }) {
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('driver_data').then(d => { if (d) setDriver(JSON.parse(d)); });
    driverAPI.getProfile().then(r => setDriver(r.data.driver)).catch(() => {});
    driverAPI.getStats().then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Ha, chiqish', style: 'destructive', onPress: onLogout },
    ]);
  };

  const rows = driver ? [
    ['📱 Telefon', driver.phone],
    ['🚗 Mashina', driver.car_model || '—'],
    ['🔢 Davlat raqami', driver.car_number || '—'],
    ['🎨 Rang', driver.car_color || '—'],
    ['📍 Viloyat', driver.region || '—'],
    ['📜 Guvohnoma', driver.license_number || '—'],
    ['📅 Ro\'yxat sanasi', new Date(driver.created_at).toLocaleDateString('uz-UZ')],
  ] : [];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{driver?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={s.name}>{driver?.name || 'Haydovchi'}</Text>
        <View style={s.ratingRow}>
          <Text style={s.ratingText}>⭐ {parseFloat(driver?.rating || 5).toFixed(1)}</Text>
          <View style={[s.verifiedBadge, { backgroundColor: driver?.is_verified ? '#d1fae5' : '#fef3c7' }]}>
            <Text style={{ fontSize: 12, color: driver?.is_verified ? '#065f46' : '#92400e', fontWeight: '600' }}>
              {driver?.is_verified ? '✓ Tasdiqlangan' : '⏳ Tasdiqlanmagan'}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      {stats && (
        <View style={s.statsRow}>
          {[
            { val: stats.completed_trips || 0, lbl: 'Bajarilgan' },
            { val: `${((stats.total_earnings || 0) / 1000).toFixed(0)}K`, lbl: 'Daromad (so\'m)' },
            { val: parseFloat(stats.avg_rating || 5).toFixed(1), lbl: 'Reyting' },
          ].map(item => (
            <View key={item.lbl} style={s.statBox}>
              <Text style={s.statVal}>{item.val}</Text>
              <Text style={s.statLbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Info rows */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Ma'lumotlar</Text>
        {rows.map(([k, v]) => (
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
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  ratingText: { color: '#fdcb6e', fontSize: 16, fontWeight: '700' },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statsRow: { flexDirection: 'row', margin: 16, backgroundColor: '#252542', borderRadius: 14 },
  statBox: { flex: 1, alignItems: 'center', padding: 16, borderRightWidth: 1, borderRightColor: '#374151' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statLbl: { color: '#9ca3af', fontSize: 11, marginTop: 4, textAlign: 'center' },
  section: { margin: 16, backgroundColor: '#252542', borderRadius: 14, padding: 4 },
  sectionTitle: { color: '#9ca3af', fontSize: 12, fontWeight: '600', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#374151' },
  infoKey: { color: '#9ca3af', fontSize: 14 },
  infoVal: { color: '#fff', fontSize: 14, fontWeight: '500', maxWidth: 200, textAlign: 'right' },
  logoutBtn: { margin: 16, backgroundColor: '#2d1a1a', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d' },
  logoutText: { color: '#e17055', fontWeight: '700', fontSize: 15 },
});
