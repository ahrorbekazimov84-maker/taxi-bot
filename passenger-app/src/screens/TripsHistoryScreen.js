import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import { passengerAPI, tripAPI } from '../utils/api';

const STATUS = {
  completed:   { label: 'Bajarildi',      color: '#00b894', bg: '#d1fae5' },
  cancelled:   { label: 'Bekor qilindi',  color: '#e17055', bg: '#fee2e2' },
  in_progress: { label: 'Jarayonda',      color: '#6c5ce7', bg: '#ede9fe' },
  accepted:    { label: 'Qabul qilingan', color: '#0984e3', bg: '#dbeafe' },
  searching:   { label: 'Qidirilmoqda',   color: '#fdcb6e', bg: '#fef3c7' },
};

const mockTrips = [
  { id:'1', from_address:'Toshkent, Chilonzor', to_address:'Toshkent, Yunusobod', distance_km:12.4, price:32800, status:'completed', driver_name:'Alisher K.', car_model:'Malibu', car_number:'01A123BB', payment_method:'payme', created_at:'2025-05-27T08:30:00', driver_rating:5 },
  { id:'2', from_address:'Samarqand, Registon', to_address:'Samarqand, Ulugbek', distance_km:6.2, price:17160, status:'completed', driver_name:'Bobur R.', car_model:'Nexia 3', car_number:'10B456CC', payment_method:'cash', created_at:'2025-05-26T14:00:00', driver_rating:null },
  { id:'3', from_address:'Farg\'ona, Markaziy', to_address:'Farg\'ona, Dachi', distance_km:8.1, price:20580, status:'cancelled', driver_name:null, car_model:null, car_number:null, payment_method:'click', created_at:'2025-05-25T11:00:00', driver_rating:null },
];

export default function TripsHistoryScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(null); // trip
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    passengerAPI.getMyTrips({ limit: 20 })
      .then(r => setTrips(r.data.trips))
      .catch(() => setTrips(mockTrips))
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async () => {
    try { await tripAPI.rate(ratingModal.id, rating, comment); } catch {}
    setTrips(prev => prev.map(t => t.id === ratingModal.id ? { ...t, driver_rating: rating } : t));
    setRatingModal(null); setRating(5); setComment('');
  };

  const renderItem = ({ item: t }) => {
    const st = STATUS[t.status] || { label: t.status, color: '#636e72', bg: '#f3f4f6' };
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.addr} numberOfLines={1}>📍 {t.from_address}</Text>
            <Text style={s.addr} numberOfLines={1}>🏁 {t.to_address}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: st.bg }]}>
            <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {t.driver_name && (
          <View style={s.driverRow}>
            <View style={s.driverAvatar}><Text style={{ color: '#6c5ce7', fontWeight: '700' }}>{t.driver_name.charAt(0)}</Text></View>
            <View>
              <Text style={s.driverName}>{t.driver_name}</Text>
              <Text style={s.carInfo}>{t.car_model} · {t.car_number}</Text>
            </View>
          </View>
        )}

        <View style={s.cardFooter}>
          <Text style={s.meta}>{t.distance_km} km  ·  {t.payment_method}</Text>
          <Text style={s.meta}>{new Date(t.created_at).toLocaleDateString('uz-UZ')}</Text>
          {t.status === 'completed' && <Text style={s.price}>{Number(t.price).toLocaleString()} so'm</Text>}
        </View>

        {t.status === 'completed' && !t.driver_rating && (
          <TouchableOpacity style={s.rateBtn} onPress={() => { setRatingModal(t); setRating(5); setComment(''); }}>
            <Text style={s.rateBtnText}>⭐ Haydovchini baholang</Text>
          </TouchableOpacity>
        )}
        {t.driver_rating && <Text style={s.ratedText}>{'⭐'.repeat(t.driver_rating)} Baholangan</Text>}
      </View>
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#6c5ce7" size="large" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Trip tarixi</Text>
        <Text style={s.sub}>{trips.length} ta safar</Text>
      </View>

      <FlatList data={trips} keyExtractor={t => t.id} renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ListEmptyComponent={<Text style={s.empty}>Hali triplar yo'q</Text>} />

      <Modal visible={!!ratingModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Haydovchini baholang</Text>
            <Text style={s.modalSub}>{ratingModal?.driver_name}</Text>
            <View style={s.starsRow}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={{ fontSize: 36 }}>{n <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.commentInput} placeholder="Izoh (ixtiyoriy)" placeholderTextColor="#9ca3af"
              value={comment} onChangeText={setComment} multiline />
            <TouchableOpacity style={s.submitBtn} onPress={handleRate}>
              <Text style={s.submitText}>Yuborish</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRatingModal(null)}>
              <Text style={s.skip}>Bekor qilish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fa' },
  center: { flex: 1, backgroundColor: '#f4f6fa', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 52, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  sub: { color: '#636e72', fontSize: 13, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  addr: { color: '#374151', fontSize: 13, marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginBottom: 8 },
  driverAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center' },
  driverName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  carInfo: { fontSize: 11, color: '#636e72', marginTop: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  meta: { color: '#9ca3af', fontSize: 12 },
  price: { color: '#00b894', fontWeight: '700', fontSize: 14 },
  rateBtn: { marginTop: 10, backgroundColor: '#fef3c7', borderRadius: 8, padding: 10, alignItems: 'center' },
  rateBtnText: { color: '#92400e', fontWeight: '600', fontSize: 13 },
  ratedText: { marginTop: 8, color: '#fdcb6e', fontSize: 12 },
  empty: { textAlign: 'center', color: '#636e72', padding: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  modalSub: { color: '#636e72', fontSize: 14, marginBottom: 18 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  commentInput: { width: '100%', backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, fontSize: 14, color: '#1a1a2e', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 14, minHeight: 60, textAlignVertical: 'top' },
  submitBtn: { width: '100%', backgroundColor: '#6c5ce7', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  skip: { color: '#9ca3af', fontSize: 13 },
});
