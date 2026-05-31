import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL =
  Constants.expoConfig?.extra?.API_URL ||
  Constants.manifest?.extra?.API_URL ||
  'https://taxi-backend.onrender.com/api';

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
