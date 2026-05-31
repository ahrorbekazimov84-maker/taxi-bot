import React, { useState } from 'react';

const mockPassengers = [
  { id:'1', name:'Dilnoza Yusupova', phone:'+998901112233', rating:4.9, total_trips:45, is_active:true, created_at:'2024-01-10' },
  { id:'2', name:'Sarvar Mirzayev', phone:'+998911223344', rating:4.7, total_trips:23, is_active:true, created_at:'2024-02-14' },
  { id:'3', name:'Malika Xasanova', phone:'+998931234567', rating:4.5, total_trips:12, is_active:true, created_at:'2024-03-20' },
  { id:'4', name:'Otabek Normatov', phone:'+998901237890', rating:3.8, total_trips:67, is_active:false, created_at:'2023-11-05' },
  { id:'5', name:'Zulfiya Tosheva', phone:'+998990001122', rating:5.0, total_trips:89, is_active:true, created_at:'2023-09-22' },
];

export default function PassengersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = mockPassengers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Yo'lovchilar</h1>
          <p className="page-subtitle">Jami: {mockPassengers.length} ta foydalanuvchi</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <input className="input" style={{ maxWidth: 300 }} placeholder="🔍 Ism yoki telefon bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Yo'lovchi</th>
              <th>Telefon</th>
              <th>Reyting</th>
              <th>Triplar</th>
              <th>Holat</th>
              <th>Ro'yxat sanasi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                      {p.name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ color: '#636e72' }}>{p.phone}</td>
                <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>⭐ {p.rating.toFixed(1)}</span></td>
                <td>{p.total_trips}</td>
                <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>{p.is_active ? 'Faol' : 'Bloklangan'}</span></td>
                <td style={{ color: '#636e72', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('uz-UZ')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelected(p)}>Ko'rish</button>
                    <button className="btn btn-sm" style={{ background: p.is_active ? '#fee2e2' : '#d1fae5', color: p.is_active ? '#991b1b' : '#065f46' }}>
                      {p.is_active ? 'Bloklash' : 'Faollashtirish'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty">Yo'lovchi topilmadi</div>}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card" style={{ width: 380, maxWidth: '90vw', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', fontSize: 20, color: '#636e72' }}>✕</button>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
                {selected.name?.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{selected.name}</h3>
                <p style={{ color: '#636e72', fontSize: 13 }}>{selected.phone}</p>
              </div>
            </div>
            {[
              ['Reyting', `⭐ ${selected.rating.toFixed(1)}`],
              ['Jami triplar', selected.total_trips],
              ['Holat', selected.is_active ? '✅ Faol' : '❌ Bloklangan'],
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
