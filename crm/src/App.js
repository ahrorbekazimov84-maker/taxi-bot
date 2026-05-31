import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import DriversPage from './pages/DriversPage';
import PassengersPage from './pages/PassengersPage';
import TripsPage from './pages/TripsPage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('crm_token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('crm_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
  };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/drivers" element={<DriversPage token={token} />} />
          <Route path="/passengers" element={<PassengersPage token={token} />} />
          <Route path="/trips" element={<TripsPage token={token} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
