import React, { useState, useEffect, useCallback } from 'react';
import { driversAPI } from '../utils/api';

const REGIONS = ['Barchasi','Toshkent','Samarqand','Buxoro','Farg\'ona','Andijon','Namangan','Qashqadaryo','Surxondaryo','Xorazm'];

const mockDrivers = [
  { id:'1', name:'Alisher Karimov', phone:'+998901234567', car_model:'Chevrolet Malibu', car_number:'01A123BB', car_color:'Oq', rating:4.8, total_trips:234, is_online:true, is_verified:true, region:'Toshkent', created_at:'2024-01-15' },
  { id:'2', name:'Bobur Rahimov', phone:'+998911234567', car_model:'Nexia 3', car_number:'10B456CC', car_color:'Qora', rating:4.6, total_trips:178, is_online:false, is_verified:true, region:'Samarqand', created_at:'2024-02-20' },
  { id:'3', name:'Jasur Toshmatov', phone:'+998931234567', car_model:'Cobalt', car_number:'30C789DD', car_color:'Kumush', rating:4.9, total_trips:312, is_online:true, is_verified:false, region:'Farg\'ona', created_at:'2024-03-10' },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [isVerified, setIsVerified] = useState('');
  const [selected, setSelected] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (region && region !== 'Barchasi') params.region = region;
      if (isVerified !== '') params.is_verified = isVerified;
      const res = await driversAPI.getAll(params);
      setDrivers(res.data.drivers);
      setTotal(res.data.total);
    } catch {
      setDrivers(mockDrivers);
      setTotal(mockDrivers.length);
    } finally {
      setLoading(false);
    }
  }, [search, region, isVerified]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleVerify = async (id, val) => {
    try {
      await driversAPI.verify(id, val);
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, is_verified: val } : d));
    } catch {
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, is_verified: val } : d));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Haydovchilar</h1>
          <p className="page-subtitle">Jami: {total} ta haydovchi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="🔍 Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 160 }} value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 160 }} value={isVerified} onChange={e => setIsVerified(e.target.value)}>
          <option value="">Barchasi</option>
          <option value="true">Tasdiqlangan</option>
          <option value="false">Tasdiqlanmagan</option>
        </select>
        <button className="btn btn-primary" onClick={fetchDrivers}>Qidirish</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="loading">Yuklanmoqda...</div> : (
          <table>
            <thead>
              <tr>
                <th>Haydovchi</th>
                <th>Telefon</th>
                <th>Mashina</th>
                <th>Viloyat</th>
                <th>Reyting</th>
                <th>Triplar</th>
                <th>Holat</th>
                <th>Tasdiqlash</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', color: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                        {d.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#636e72' }}>{d.phone}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.car_model}</div>
                    <div style={{ fontSize: 12, color: '#636e72' }}>{d.car_number} · {d.car_color}</div>
                  </td>
                  <td>{d.region}</td>
                  <td>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>⭐ {parseFloat(d.rating || 0).toFixed(1)}</span>
                  </td>
                  <td>{d.total_trips}</td>
                  <td>
                    <span className={`badge ${d.is_online ? 'badge-green' : 'badge-gray'}`}>
                      {d.is_online ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${d.is_verified ? 'badge-blue' : 'badge-amber'}`}>
                      {d.is_verified ? '✓ Tasdiqlangan' : '⏳ Kutilmoqda'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(d)}>Ko'rish</button>
                      {!d.is_verified
                        ? <button className="btn btn-success btn-sm" onClick={() => handleVerify(d.id, true)}>Tasdiqlash</button>
                        : <button className="btn btn-outline btn-sm" style={{ color: '#e17055', borderColor: '#e17055' }} onClick={() => handleVerify(d.id, false)}>Bekor</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && drivers.length === 0 && <div className="empty">Haydovchi topilmadi</div>}
      </div>

      {/* Driver detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 440, maxWidth: '90vw', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', fontSize: 20, color: '#636e72' }}>✕</button>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ede9fe', color: '#6c5ce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
                {selected.name?.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{selected.name}</h3>
                <p style={{ color: '#636e72', fontSize: 13 }}>{selected.phone}</p>
              </div>
            </div>
            {[
              ['Mashina', `${selected.car_model} · ${selected.car_number}`],
              ['Rang', selected.car_color],
              ['Viloyat', selected.region],
              ['Reyting', `⭐ ${parseFloat(selected.rating || 0).toFixed(1)}`],
              ['Jami triplar', selected.total_trips],
              ['Holati', selected.is_online ? '🟢 Online' : '⚫ Offline'],
              ['Tasdiqlash', selected.is_verified ? '✅ Ha' : '❌ Yo\'q'],
              ['Ro\'yxatdan o\'tgan', new Date(selected.created_at).toLocaleDateString('uz-UZ')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#636e72', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
