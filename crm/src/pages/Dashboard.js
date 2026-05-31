import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardAPI } from '../utils/api';

const mockChartData = [
  { kun: 'Du', triplar: 42, daromad: 840000 },
  { kun: 'Se', triplar: 58, daromad: 1160000 },
  { kun: 'Ch', triplar: 51, daromad: 1020000 },
  { kun: 'Pa', triplar: 73, daromad: 1460000 },
  { kun: 'Ju', triplar: 89, daromad: 1780000 },
  { kun: 'Sh', triplar: 95, daromad: 1900000 },
  { kun: 'Ya', triplar: 67, daromad: 1340000 },
];

const formatPrice = (v) => (v / 1000).toFixed(0) + 'K';

export default function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(() => {
        // Demo data agar backend yo'q bo'lsa
        setStats({
          trips: { total: 1243, completed: 1105, searching: 8, in_progress: 12, today: 89 },
          drivers: { total: 87, online: 23, verified: 71 },
          users: { total: 3421 },
          revenue: { total: 24860000, today: 1780000 },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Yuklanmoqda...</div>;

  const s = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bugungi holat — {new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>🚕</div>
          <div>
            <div className="stat-value">{s.trips.today}</div>
            <div className="stat-label">Bugungi triplar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>💰</div>
          <div>
            <div className="stat-value">{(s.revenue.today / 1000).toFixed(0)}K</div>
            <div className="stat-label">Bugungi daromad (so'm)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>🚗</div>
          <div>
            <div className="stat-value">{s.drivers.online} / {s.drivers.total}</div>
            <div className="stat-label">Online haydovchilar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>👥</div>
          <div>
            <div className="stat-value">{s.users.total?.toLocaleString()}</div>
            <div className="stat-label">Jami yo'lovchilar</div>
          </div>
        </div>
      </div>

      {/* Trip statuses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Triplar grafik */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Haftalik triplar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockChartData}>
              <XAxis dataKey="kun" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#636e72' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#636e72' }} />
              <Tooltip formatter={(v) => [v, 'Triplar']} />
              <Bar dataKey="triplar" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daromad grafik */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Haftalik daromad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockChartData}>
              <XAxis dataKey="kun" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#636e72' }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatPrice} tick={{ fontSize: 11, fill: '#636e72' }} />
              <Tooltip formatter={(v) => [v.toLocaleString() + " so'm", 'Daromad']} />
              <Line type="monotone" dataKey="daromad" stroke="#00b894" strokeWidth={2.5} dot={{ fill: '#00b894', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status qutilari */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Jami triplar', val: s.trips.total, color: '#6c5ce7', bg: '#ede9fe' },
          { label: 'Bajarilgan', val: s.trips.completed, color: '#00b894', bg: '#d1fae5' },
          { label: 'Jarayonda', val: s.trips.in_progress, color: '#0984e3', bg: '#dbeafe' },
          { label: 'Qidirilmoqda', val: s.trips.searching, color: '#fdcb6e', bg: '#fef3c7' },
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.val}</div>
            <div style={{ fontSize: 12, color: '#636e72', marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
