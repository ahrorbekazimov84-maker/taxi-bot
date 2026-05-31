import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { driverAPI, tripAPI, API_URL } from '../utils/api';

export default function HomeScreen() {
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [tripRequest, setTripRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      socketRef.current?.disconnect();
      locationRef.current?.remove();
    };
  }, []);

  const loadData = async () => {
    try {
      const cached = await AsyncStorage.getItem('driver_data');
      if (cached) setDriver(JSON.parse(cached));
      const [profileRes, statsRes] = await Promise.all([driverAPI.getProfile(), driverAPI.getStats()]);
      setDriver(profileRes.data.driver);
      setStats(statsRes.data.stats);
      setIsOnline(profileRes.data.driver.is_online);
      await AsyncStorage.setItem('driver_data', JSON.stringify(profileRes.data.driver));
    } catch (e) {
      console.log('Profil yuklashda xato:', e.message);
    }
  };

  const connectSocket = async (driverId) => {
    const socket = io(API_URL.replace('/api', ''), { transports: ['websocket'] });
    socket.on('connect', () => socket.emit('driver_connect', driverId));
    socket.on('new_trip_request', (data) => setTripRequest(data));
    socket.on('trip_cancelled', () => { setTripRequest(null); setActiveTrip(null); Alert.alert('Trip bekor qilindi', 'Yo\'lovchi tripni bekor qildi'); });
    socketRef.current = socket;
  };

  const startLocationTracking = async (driverId) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Ruxsat kerak', 'Lokatsiyaga ruxsat bering');
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 20 },
      ({ coords }) => driverAPI.updateLocation(coords.latitude, coords.longitude).catch(() => {})
    );
    locationRef.current = sub;
  };

  const handleToggleOnline = async () => {
    setLoading(true);
    try {
      const res = await driverAPI.toggleOnline();
      const online = res.data.is_online;
      setIsOnline(online);
      if (online && driver) {
        await connectSocket(driver.id);
        await startLocationTracking(driver.id);
      } else {
        socketRef.current?.disconnect();
        locationRef.current?.remove();
      }
    } catch (err) {
      Alert.alert('Xato', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!tripRequest) return;
    try {
      const res = await tripAPI.accept(tripRequest.trip.id);
      setActiveTrip(res.data.trip);
      setTripRequest(null);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Qabul qilishda xato');
      setTripRequest(null);
    }
  };

  const handleReject = () => setTripRequest(null);

  const handleStart = async () => {
    try {
      const res = await tripAPI.start(activeTrip.id);
      setActiveTrip(res.data.trip);
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message);
    }
  };

  const handleComplete = async () => {
    Alert.alert('Tripni yakunlash', 'Tripni yakunlashni tasdiqlaysizmi?', [
      { text: 'Bekor', style: 'cancel' },
      { text: 'Ha, yakunlash', onPress: async () => {
        try {
          await tripAPI.complete(activeTrip.id);
          setActiveTrip(null);
          loadData();
          Alert.alert('✅ Trip yakunlandi!');
        } catch (err) {
          Alert.alert('Xato', err.response?.data?.message);
        }
      }},
    ]);
  };

  const formatPrice = (v) => v ? Number(v).toLocaleString() + " so'm" : '0';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Assalomu alaykum,</Text>
          <Text style={s.name}>{driver?.name || 'Haydovchi'} 👋</Text>
        </View>
        <View style={s.onlineBadge}>
          <View style={[s.dot, { backgroundColor: isOnline ? '#00b894' : '#636e72' }]} />
          <Text style={[s.onlineText, { color: isOnline ? '#00b894' : '#636e72' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Online toggle */}
      <View style={s.toggleCard}>
        <View>
          <Text style={s.toggleTitle}>{isOnline ? '🟢 Buyurtmalar qabul qilinmoqda' : '⚫ Offline rejim'}</Text>
          <Text style={s.toggleSub}>{isOnline ? 'Yangi buyurtmalar keladi' : 'Ishlashni boshlash uchun online qiling'}</Text>
        </View>
        {loading ? <ActivityIndicator color="#6c5ce7" /> : <Switch value={isOnline} onValueChange={handleToggleOnline} trackColor={{ false: '#374151', true: '#6c5ce7' }} thumbColor="#fff" />}
      </View>

      {/* Trip request modal */}
      {tripRequest && (
        <View style={s.requestCard}>
          <Text style={s.requestTitle}>🚕 Yangi buyurtma!</Text>
          <View style={s.requestRow}><Text style={s.requestLabel}>📍 Olish joyi:</Text><Text style={s.requestVal}>{tripRequest.trip.from_address}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>🏁 Borish joyi:</Text><Text style={s.requestVal}>{tripRequest.trip.to_address}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>📏 Masofa:</Text><Text style={s.requestVal}>{tripRequest.trip.distance_km} km</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>💰 Narx:</Text><Text style={[s.requestVal, { color: '#00b894', fontWeight: '700' }]}>{formatPrice(tripRequest.trip.price)}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>💳 To'lov:</Text><Text style={s.requestVal}>{tripRequest.trip.payment_method}</Text></View>
          <View style={s.requestBtns}>
            <TouchableOpacity style={[s.reqBtn, { backgroundColor: '#e17055' }]} onPress={handleReject}><Text style={s.reqBtnText}>✕ Rad etish</Text></TouchableOpacity>
            <TouchableOpacity style={[s.reqBtn, { backgroundColor: '#00b894' }]} onPress={handleAccept}><Text style={s.reqBtnText}>✓ Qabul qilish</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* Active trip */}
      {activeTrip && (
        <View style={s.activeTripCard}>
          <Text style={s.activeTripTitle}>🚗 Faol trip</Text>
          <View style={s.requestRow}><Text style={s.requestLabel}>📍 Manzildan:</Text><Text style={s.requestVal}>{activeTrip.from_address}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>🏁 Manziliga:</Text><Text style={s.requestVal}>{activeTrip.to_address}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>💰 Narx:</Text><Text style={[s.requestVal, { color: '#00b894', fontWeight: '700' }]}>{formatPrice(activeTrip.price)}</Text></View>
          <View style={s.requestRow}><Text style={s.requestLabel}>Holat:</Text>
            <Text style={[s.requestVal, { color: activeTrip.status === 'in_progress' ? '#6c5ce7' : '#fdcb6e' }]}>
              {activeTrip.status === 'accepted' ? '⏳ Yo\'lovchi kutmoqda' : '🚗 Jarayonda'}
            </Text>
          </View>
          {activeTrip.status === 'accepted' && (
            <TouchableOpacity style={[s.reqBtn, { backgroundColor: '#6c5ce7', marginTop: 12 }]} onPress={handleStart}>
              <Text style={s.reqBtnText}>▶ Tripni boshlash</Text>
            </TouchableOpacity>
          )}
          {activeTrip.status === 'in_progress' && (
            <TouchableOpacity style={[s.reqBtn, { backgroundColor: '#00b894', marginTop: 12 }]} onPress={handleComplete}>
              <Text style={s.reqBtnText}>✓ Tripni yakunlash</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Today stats */}
      {stats && (
        <View style={s.statsSection}>
          <Text style={s.sectionTitle}>Bugungi natijalar</Text>
          <View style={s.statsGrid}>
            <View style={s.statBox}><Text style={s.statVal}>{stats.today_trips || 0}</Text><Text style={s.statLbl}>Trip</Text></View>
            <View style={s.statBox}><Text style={[s.statVal, { color: '#00b894' }]}>{formatPrice(stats.today_earnings)}</Text><Text style={s.statLbl}>Daromad</Text></View>
            <View style={s.statBox}><Text style={[s.statVal, { color: '#f59e0b' }]}>⭐ {parseFloat(stats.avg_rating || 5).toFixed(1)}</Text><Text style={s.statLbl}>Reyting</Text></View>
            <View style={s.statBox}><Text style={s.statVal}>{stats.completed_trips || 0}</Text><Text style={s.statLbl}>Jami trip</Text></View>
          </View>
        </View>
      )}

      {/* Car info */}
      {driver && (
        <View style={s.carCard}>
          <Text style={s.sectionTitle}>🚗 Mashina</Text>
          <Text style={s.carModel}>{driver.car_model || 'Mashina qo\'shilmagan'}</Text>
          <Text style={s.carNum}>{driver.car_number} · {driver.car_color}</Text>
          {!driver.is_verified && (
            <View style={s.verifyWarning}>
              <Text style={{ color: '#92400e', fontSize: 12 }}>⚠️ Hisobingiz hali tasdiqlanmagan. Admin tasdiqlashini kuting.</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  greeting: { color: '#9ca3af', fontSize: 13 },
  name: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 2 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#252542', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontSize: 13, fontWeight: '600' },
  toggleCard: { margin: 16, backgroundColor: '#252542', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  toggleSub: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  requestCard: { margin: 16, backgroundColor: '#2d2d4e', borderRadius: 16, padding: 18, borderWidth: 2, borderColor: '#6c5ce7' },
  requestTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  requestRow: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  requestLabel: { color: '#9ca3af', fontSize: 13, width: 100 },
  requestVal: { color: '#fff', fontSize: 13, flex: 1 },
  requestBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  reqBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  reqBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  activeTripCard: { margin: 16, backgroundColor: '#1e3a2e', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#00b894' },
  activeTripTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  statsSection: { margin: 16 },
  sectionTitle: { color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statBox: { backgroundColor: '#252542', borderRadius: 12, padding: 16, flex: 1, minWidth: '45%', alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statLbl: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  carCard: { margin: 16, backgroundColor: '#252542', borderRadius: 16, padding: 18 },
  carModel: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  carNum: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  verifyWarning: { backgroundColor: '#fef3c7', borderRadius: 8, padding: 10, marginTop: 12 },
});
