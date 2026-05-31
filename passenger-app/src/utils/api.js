import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://YOUR_SERVER_IP:5000/api'; // <-- serveringiz IP sini yozing

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('passenger_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const passengerAuthAPI = {
  register: (data) => api.post('/auth/passenger/register', data),
  login: (data) => api.post('/auth/passenger/login', data),
};

export const passengerAPI = {
  getMyTrips: (params) => api.get('/trips/my', { params }),
};

export const tripAPI = {
  create: (data) => api.post('/trips', data),
  cancel: (trip_id, cancel_reason) => api.post(`/trips/${trip_id}/cancel`, { cancel_reason }),
  rate: (trip_id, rating, comment) => api.post(`/trips/${trip_id}/rate`, { rating, comment }),
};
