import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripAPI, API_URL } from '../utils/api';

const PAYMENT_METHODS = [
  { key: 'cash',  label: '💵 Naqd pul' },
  { key: 'payme', label: '💳 Payme' },
  { key: 'click', label: '📲 Click' },
];

const POPULAR_ROUTES = [
  { from: 'Toshkent, Yunusobod', to: 'Toshkent, Chilonzor', fromLat: 41.3425, fromLng: 69.3123, toLat: 41.2995, toLng: 69.2401 },
  { from: 'Toshkent, Bektemir', to: 'Toshkent, Mirzo Ulugbek', fromLat: 41.2789, fromLng: 69.3567, toLat: 41.3312, toLng: 69.3456 },
  { from: 'Samarqand, Registon', to: 'Samarqand, Vokzal', fromLat: 39.6542, fromLng: 66.9758, toLat: 39.6678, toLng: 66.9589 },
];

export default function BookingScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromLat, setFromLat] = useState(null);
  const [fromLng, setFromLng] = useState(null);
  const [toLat, setToLat] = useState(null);
  const [toLng, setToLng] = useState(null);
  const [payment, setPayment] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripStatus, setTripStatus] = useState('');
  const [driverInfo, setDriverInfo] = useState(null);
  const [ratingModal, setRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    connectSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setFromLat(loc.coords.latitude);
      setFromLng(loc.coords.longitude);
      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr[0]) setFrom(`${addr[0].city || ''}, ${addr[0].street || ''}`);
    } catch {}
  };

  const connectSocket = async () => {
    const data = await AsyncStorage.getItem('passenger_data');
    if (!data) return;
    const user = JSON.parse(data);
    const socket = io(API_URL.replace('/api', ''), { transports: ['websocket'] });
    socket.on('connect', () => socket.emit('passenger_connect', user.id));
    socket.on('trip_accepted', ({ trip, driver_id }) => {
      setTripStatus('accepted');
      setDriverInfo({ id: driver_id });
      Alert.alert('🎉 Haydovchi topildi!', 'Haydovchi yo\'lingizda');
    });
    socket.on('trip_started', () => setTripStatus('in_progress'));
    socket.on('trip_completed', ({ trip }) => {
      setTripStatus('completed');
      setActiveTrip(trip);
      setRatingModal(true);
    });
    socket.on('trip_cancelled', ({ cancelled_by }) => {
      setActiveTrip(null);
      setTripStatus('');
      Alert.alert('Trip bekor qilindi', cancelled_by === 'driver' ? 'Haydovchi tripni bekor qildi' : 'Trip bekor qilindi');
    });
    socketRef.current = socket;
  };

  const handleBook = async () => {
    if (!from || !to) return Alert.alert('Xato', 'Manzillarni kiriting');
    // Demo koordinatlar (haqiqiy loyihada Google Places API ishlatiladi)
    const fLat = fromLat || 41.2995;
    const fLng = fromLng || 69.2401;
    const tLat = toLat || 41.3425;
    const tLng = toLng || 69.3123;
    setLoading(true);
    try {
      const res = await tripAPI.create({
        from_address: from, from_lat: fLat, from_lng: fLng,
        to_address: to, to_lat: tLat, to_lng: tLng,
        payment_method: payment,
      });
      setActiveTrip(res.data.trip);
      setTripStatus('searching');
    } catch (err) {
      Alert.alert('Xato', err.response?.data?.message || 'Buyurtma yuborishda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Bekor qilish', 'Tripni bekor qilmoqchimisiz?', [
      { text: 'Yo\'q', style: 'cancel' },
      { text: 'Ha, bekor qilish', style: 'destructive', onPress: async () => {
        try {
          await tripAPI.cancel(activeTrip.id, 'Yo\'lovchi bekor qildi');
          setActiveTrip(null);
          setTripStatus('');
        } catch {}
      }},
    ]);
  };

  const handleRate = async () => {
    try {
      await tripAPI.rate(activeTrip.id, rating, comment);
    } catch {}
    setRatingModal(false);
    setActiveTrip(null);
    setTripStatus('');
    setFrom(''); setTo('');
    Alert.alert('✅ Rahmat!', 'Bahoingiz qabul qilindi');
  };

  const usePopularRoute = (route) => {
    setFrom(route.from); setTo(route.to);
    setFromLat(route.fromLat); setFromLng(route.fromLng);
    setToLat(route.toLat); setToLng(route.toLng);
  };

  const statusLabels = {
    searching:   { icon: '🔍', text: 'Haydovchi qidirilmoqda...', color: '#fdcb6e' },
    accepted:    { icon: '🚗', text: 'Haydovchi yo\'lda',         color: '#6c5ce7' },
    in_progress: { icon: '🚀', text: 'Safar jarayonda',           color: '#00b894' },
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <Text style={s.title}>🚕 TaxiGo</Text>
        <Text style={s.subtitle}>Qayerga borasiz?</Text>
      </View>

      {!activeTrip ? (
        <>
          {/* Manzil inputlar */}
          <View style={s.addressCard}>
            <View style={s.addressRow}>
              <Text style={s.addrDot}>📍</Text>
              <TextInput style={s.addrInput} placeholder="Qayerdan (boshlang'ich manzil)"
                placeholderTextColor="#9ca3af" value={from} onChangeText={setFrom} />
            </View>
            <View style={s.divider} />
            <View style={s.addressRow}>
              <Text style={s.addrDot}>🏁</Text>
              <TextInput style={s.addrInput} placeholder="Qayerga (borish manzili)"
                placeholderTextColor="#9ca3af" value={to} onChangeText={setTo} />
            </View>
          </View>

          {/* To'lov usuli */}
          <Text style={s.sectionLabel}>To'lov usuli</Text>
          <View style={s.paymentRow}>
            {PAYMENT_METHODS.map(p => (
              <TouchableOpacity key={p.key} style={[s.payBtn, payment === p.key && s.payBtnActive]}
                onPress={() => setPayment(p.key)}>
                <Text style={[s.payBtnText, payment === p.key && s.payBtnTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mashhur yo'nalishlar */}
          <Text style={s.sectionLabel}>Mashhur yo'nalishlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, gap: 10 }}>
            {POPULAR_ROUTES.map((r, i) => (
              <TouchableOpacity key={i} style={s.routeChip} onPress={() => usePopularRoute(r)}>
                <Text style={s.routeChipText} numberOfLines={1}>{r.from.split(',')[1]?.trim()} → {r.to.split(',')[1]?.trim()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Buyurtma tugmasi */}
          <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.bookBtnText}>🚕 Taxi chaqirish</Text>}
          </TouchableOpacity>
        </>
      ) : (
        /* Aktiv trip holati */
        <View style={s.activeTripSection}>
          {statusLabels[tripStatus] && (
            <View style={[s.statusCard, { borderColor: statusLabels[tripStatus].color }]}>
              <Text style={s.statusIcon}>{statusLabels[tripStatus].icon}</Text>
              <Text style={[s.statusText, { color: statusLabels[tripStatus].color }]}>{statusLabels[tripStatus].text}</Text>
              {tripStatus === 'searching' && <ActivityIndicator color={statusLabels[tripStatus].color} style={{ marginTop: 10 }} />}
            </View>
          )}

          <View style={s.tripDetailCard}>
            <Text style={s.tripDetailTitle}>Trip ma'lumotlari</Text>
            {[
              ['📍 Manzildan', activeTrip.from_address],
              ['🏁 Manziliga', activeTrip.to_address],
              ['📏 Masofa', `${activeTrip.distance_km} km`],
              ['💰 Narx', `${Number(activeTrip.price).toLocaleString()} so'm`],
              ['💳 To\'lov', activeTrip.payment_method],
            ].map(([k, v]) => (
              <View key={k} style={s.detailRow}>
                <Text style={s.detailKey}>{k}</Text>
                <Text style={s.detailVal}>{v}</Text>
              </View>
            ))}
          </View>

          {(tripStatus === 'searching' || tripStatus === 'accepted') && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
              <Text style={s.cancelBtnText}>✕ Bekor qilish</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Rating modal */}
      <Modal visible={ratingModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Trip yakunlandi! 🎉</Text>
            <Text style={s.modalSub}>Haydovchini baholang</Text>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={{ fontSize: 36 }}>{n <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.commentInput} placeholder="Izoh qoldiring (ixtiyoriy)"
              placeholderTextColor="#9ca3af" value={comment} onChangeText={setComment} multiline />
            <TouchableOpacity style={s.rateBtn} onPress={handleRate}>
              <Text style={s.rateBtnText}>Baholash</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setRatingModal(false); setActiveTrip(null); setTripStatus(''); }}>
              <Text style={s.skipText}>O'tkazib yuborish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fa' },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#636e72', marginTop: 2 },
  addressCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 },
  addrDot: { fontSize: 18, marginRight: 10 },
  addrInput: { flex: 1, fontSize: 15, color: '#1a1a2e', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', paddingHorizontal: 20, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  paymentRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  payBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb' },
  payBtnActive: { borderColor: '#6c5ce7', backgroundColor: '#ede9fe' },
  payBtnText: { fontSize: 12, color: '#636e72', fontWeight: '600' },
  payBtnTextActive: { color: '#6c5ce7' },
  routeChip: { backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#e5e7eb' },
  routeChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  bookBtn: { margin: 16, marginTop: 20, backgroundColor: '#6c5ce7', borderRadius: 14, padding: 17, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  activeTripSection: { padding: 16 },
  statusCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, marginBottom: 14 },
  statusIcon: { fontSize: 40, marginBottom: 8 },
  statusText: { fontSize: 16, fontWeight: '700' },
  tripDetailCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tripDetailTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailKey: { color: '#636e72', fontSize: 13 },
  detailVal: { color: '#1a1a2e', fontSize: 13, fontWeight: '600', maxWidth: 200, textAlign: 'right' },
  cancelBtn: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5' },
  cancelBtnText: { color: '#e17055', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#636e72', marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  commentInput: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 10, padding: 13, fontSize: 14, color: '#1a1a2e', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16, minHeight: 70, textAlignVertical: 'top' },
  rateBtn: { width: '100%', backgroundColor: '#6c5ce7', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 10 },
  rateBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipText: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
});
