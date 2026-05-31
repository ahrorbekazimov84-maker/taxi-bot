import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://172.20.10.2:5000/api'; // <-- serveringiz IP sini yozing

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('driver_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const driverAuthAPI = {
  register: (data) => api.post('/auth/driver/register', data),
  login: (data) => api.post('/auth/driver/login', data),
};

export const driverAPI = {
  getProfile: () => api.get('/drivers/me'),
  getStats: () => api.get('/drivers/me/stats'),
  updateLocation: (lat, lng) => api.put('/drivers/location', { lat, lng }),
  toggleOnline: () => api.put('/drivers/toggle-online'),
  getMyTrips: (params) => api.get('/trips/my', { params }),
};

export const tripAPI = {
  accept: (trip_id) => api.post(`/trips/${trip_id}/accept`),
  start: (trip_id) => api.post(`/trips/${trip_id}/start`),
  complete: (trip_id) => api.post(`/trips/${trip_id}/complete`),
  cancel: (trip_id, cancel_reason) => api.post(`/trips/${trip_id}/cancel`, { cancel_reason }),
  rate: (trip_id, rating, comment) => api.post(`/trips/${trip_id}/rate`, { rating, comment }),
};
