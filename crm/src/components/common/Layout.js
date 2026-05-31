import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/trips',     icon: '🚕', label: 'Triplar' },
  { path: '/drivers',   icon: '🚗', label: 'Haydovchilar' },
  { path: '/passengers',icon: '👥', label: 'Yo\'lovchilar' },
];

export default function Layout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 60 : 240,
        background: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🚕</span>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 16 }}>TaxiCRM</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(108,92,231,0.35)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: 14 }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 8, width: '100%',
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 18 }}>{collapsed ? '▶' : '◀'}</span>
            {!collapsed && <span style={{ fontSize: 14 }}>Yig'ish</span>}
          </button>
          <button onClick={onLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 8, width: '100%',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
          }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            {!collapsed && <span style={{ fontSize: 14 }}>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: collapsed ? 60 : 240, flex: 1, transition: 'margin-left 0.2s', minHeight: '100vh' }}>
        <div style={{ padding: '28px 32px' }}>{children}</div>
      </main>
    </div>
  );
}
