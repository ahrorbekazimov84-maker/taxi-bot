import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { driverAPI } from '../utils/api';

const STATUS = {
  completed:   { label: 'Bajarildi',      color: '#00b894', bg: '#d1fae5' },
  cancelled:   { label: 'Bekor qilindi',  color: '#e17055', bg: '#fee2e2' },
  in_progress: { label: 'Jarayonda',      color: '#6c5ce7', bg: '#ede9fe' },
  accepted:    { label: 'Qabul qilingan', color: '#0984e3', bg: '#dbeafe' },
  searching:   { label: 'Qidirilmoqda',   color: '#fdcb6e', bg: '#fef3c7' },
};

const mockTrips = [
  { id:'1', from_address:'Toshkent, Chilonzor', to_address:'Toshkent, Yunusobod', distance_km:12.4, price:32800, status:'completed', payment_method:'payme', created_at:'2025-05-27T08:30:00', driver_rating:5 },
  { id:'2', from_address:'Samarqand, Registon', to_address:'Samarqand, Ulugbek', distance_km:6.2, price:17160, status:'completed', payment_method:'cash', created_at:'2025-05-26T14:00:00', driver_rating:4 },
  { id:'3', from_address:'Toshkent, Bektemir',  to_address:'Toshkent, Shayhantohur', distance_km:15.7, price:39400, status:'cancelled', payment_method:'cash', created_at:'2025-05-26T09:00:00', driver_rating:null },
];

export default function TripsHistoryScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { fetchTrips(1); }, []);

  const fetchTrips = async (p = 1) => {
    try {
      const res = await driverAPI.getMyTrips({ page: p, limit: 10 });
      const newTrips = res.data.trips;
      setTrips(p === 1 ? newTrips : prev => [...prev, ...newTrips]);
      setHasMore(newTrips.length === 10);
      setPage(p);
    } catch {
      if (p === 1) setTrips(mockTrips);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => { if (hasMore) fetchTrips(page + 1); };

  const totalEarned = trips.filter(t => t.status === 'completed').reduce((s, t) => s + Number(t.price || 0), 0);

  const renderItem = ({ item: t }) => {
    const st = STATUS[t.status] || { label: t.status, color: '#636e72', bg: '#f3f4f6' };
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.addr}>📍 {t.from_address}</Text>
            <Text style={s.addr}>🏁 {t.to_address}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: st.bg }]}>
            <Text style={[s.badgeText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        <View style={s.cardBottom}>
          <Text style={s.meta}>{t.distance_km} km</Text>
          <Text style={s.meta}>·</Text>
          <Text style={s.meta}>{t.payment_method}</Text>
          <Text style={s.meta}>·</Text>
          <Text style={s.date}>{new Date(t.created_at).toLocaleDateString('uz-UZ')}</Text>
          <View style={{ flex: 1 }} />
          {t.status === 'completed' && (
            <Text style={s.price}>{Number(t.price).toLocaleString()} so'm</Text>
          )}
        </View>
        {t.driver_rating && (
          <Text style={s.rating}>{'⭐'.repeat(t.driver_rating)} Baholandi</Text>
        )}
      </View>
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator color="#6c5ce7" size="large" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Trip tarixi</Text>
        <Text style={s.subtitle}>{trips.length} ta trip</Text>
      </View>

      {/* Summary */}
      <View style={s.summary}>
        <View style={s.summaryBox}>
          <Text style={s.summaryVal}>{trips.filter(t => t.status === 'completed').length}</Text>
          <Text style={s.summaryLbl}>Bajarilgan</Text>
        </View>
        <View style={s.summaryBox}>
          <Text style={[s.summaryVal, { color: '#00b894' }]}>{(totalEarned / 1000).toFixed(0)}K</Text>
          <Text style={s.summaryLbl}>Jami daromad</Text>
        </View>
        <View style={s.summaryBox}>
          <Text style={[s.summaryVal, { color: '#e17055' }]}>{trips.filter(t => t.status === 'cancelled').length}</Text>
          <Text style={s.summaryLbl}>Bekor qilingan</Text>
        </View>
      </View>

      <FlatList
        data={trips}
        keyExtractor={t => t.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={<Text style={s.empty}>Triplar yo'q</Text>}
        ListFooterComponent={hasMore ? <ActivityIndicator color="#6c5ce7" style={{ marginVertical: 16 }} /> : null}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 50, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  summary: { flexDirection: 'row', margin: 16, backgroundColor: '#252542', borderRadius: 14, overflow: 'hidden' },
  summaryBox: { flex: 1, alignItems: 'center', padding: 16, borderRightWidth: 1, borderRightColor: '#374151' },
  summaryVal: { color: '#fff', fontSize: 22, fontWeight: '700' },
  summaryLbl: { color: '#9ca3af', fontSize: 11, marginTop: 4 },
  card: { backgroundColor: '#252542', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  addr: { color: '#d1d5db', fontSize: 13, marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { color: '#9ca3af', fontSize: 12 },
  date: { color: '#9ca3af', fontSize: 12 },
  price: { color: '#00b894', fontWeight: '700', fontSize: 14 },
  rating: { color: '#fdcb6e', fontSize: 12, marginTop: 8 },
  empty: { textAlign: 'center', color: '#636e72', padding: 40 },
});
