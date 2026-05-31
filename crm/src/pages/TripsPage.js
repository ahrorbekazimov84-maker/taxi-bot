import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../utils/api';

const STATUS_LABELS = {
  searching: { label: 'Qidirilmoqda', cls: 'badge-amber' },
  accepted:  { label: 'Qabul qilindi', cls: 'badge-blue' },
  in_progress:{ label: 'Jarayonda', cls: 'badge-purple' },
  completed: { label: 'Bajarildi', cls: 'badge-green' },
  cancelled: { label: 'Bekor qilindi', cls: 'badge-red' },
};

const mockTrips = [
  { id:'t1', passenger_name:'Dilnoza Yusupova', driver_name:'Alisher Karimov', car_model:'Malibu', car_number:'01A123BB', from_address:'Toshkent, Chilonzor', to_address:'Toshkent, Yunusobod', distance_km:12.4, price:32800, status:'completed', payment_method:'payme', created_at:'2025-05-27T08:30:00' },
  { id:'t2', passenger_name:'Sarvar Mirzayev', driver_name:'Bobur Rahimov', car_model:'Nexia 3', car_number:'10B456CC', from_address:'Samarqand, Registon', to_address:'Samarqand, Ulugbek', distance_km:6.2, price:17160, status:'in_progress', payment_method:'cash', created_at:'2025-05-27T09:15:00' },
  { id:'t3', passenger_name:'Malika Xasanova', driver_name:null, car_model:null, car_number:null, from_address:'Farg\'ona, Markaziy', to_address:'Farg\'ona, Dachi', distance_km:8.1, price:20580, status:'searching', payment_method:'click', created_at:'2025-05-27T09:45:00' },
  { id:'t4', passenger_name:'Otabek Normatov', driver_name:'Jasur Toshmatov', car_model:'Cobalt', car_number:'30C789DD', from_address:'Toshkent, Bektemir', to_address:'Toshkent, Shayhantohur', distance_km:15.7, price:39400, status:'cancelled', payment_method:'cash', created_at:'2025-05-27T07:00:00' },
];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    tripsAPI.getAll({ status, limit: 50 })
      .then(res => setTrips(res.data.trips))
      .catch(() => {
        const filtered = status ? mockTrips.filter(t => t.status === status) : mockTrips;
        setTrips(filtered);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Triplar</h1>
          <p className="page-subtitle">Barcha safarlar tarixi va joriy holat</p>
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['', 'Barchasi'], ['searching','Qidirilmoqda'], ['accepted','Qabul qilingan'], ['in_progress','Jarayonda'], ['completed','Bajarilgan'], ['cancelled','Bekor qilingan']].map(([val, label]) => (
          <button key={val} onClick={() => setStatus(val)} className={`btn ${status === val ? 'btn-primary' : 'btn-outline'}`} style={{ borderRadius: 99 }}>
            {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="loading">Yuklanmoqda...</div> : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Yo'lovchi</th>
                <th>Haydovchi</th>
                <th>Marshrut</th>
                <th>Masofa</th>
                <th>Narx</th>
                <th>To'lov</th>
                <th>Holat</th>
                <th>Vaqt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t, i) => {
                const st = STATUS_LABELS[t.status] || { label: t.status, cls: 'badge-gray' };
                return (
                  <tr key={t.id}>
                    <td style={{ color: '#636e72', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{t.passenger_name || '—'}</td>
                    <td>
                      {t.driver_name
                        ? <><div style={{ fontWeight: 500 }}>{t.driver_name}</div><div style={{ fontSize: 11, color: '#636e72' }}>{t.car_model} · {t.car_number}</div></>
                        : <span style={{ color: '#636e72' }}>—</span>
                      }
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontSize: 12 }}>📍 {t.from_address}</div>
                      <div style={{ fontSize: 12, color: '#636e72' }}>🏁 {t.to_address}</div>
                    </td>
                    <td>{t.distance_km ? `${t.distance_km} km` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{t.price ? t.price.toLocaleString() + ' so\'m' : '—'}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{t.payment_method}</span></td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td style={{ fontSize: 12, color: '#636e72' }}>{new Date(t.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(t)}>Ko'rish</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && trips.length === 0 && <div className="empty">Trip topilmadi</div>}
      </div>

      {/* Trip detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 460, maxWidth: '90vw', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', fontSize: 20, color: '#636e72' }}>✕</button>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Trip tafsilotlari</h3>
            {[
              ['Yo\'lovchi', selected.passenger_name || '—'],
              ['Haydovchi', selected.driver_name || 'Haydovchi yo\'q'],
              ['Mashina', selected.car_model ? `${selected.car_model} · ${selected.car_number}` : '—'],
              ['Boshlang\'ich manzil', selected.from_address],
              ['Borish manzili', selected.to_address],
              ['Masofa', selected.distance_km ? `${selected.distance_km} km` : '—'],
              ['Narx', selected.price ? selected.price.toLocaleString() + ' so\'m' : '—'],
              ['To\'lov usuli', selected.payment_method],
              ['Holat', STATUS_LABELS[selected.status]?.label || selected.status],
              ['Vaqt', new Date(selected.created_at).toLocaleString('uz-UZ')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#636e72', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 500, fontSize: 13, textAlign: 'right', maxWidth: 260 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
