import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import BookingScreen from './screens/BookingScreen';
import TripsHistoryScreen from './screens/TripsHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ onLogout }) {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e8ecf0', paddingBottom: 4 },
      tabBarActiveTintColor: '#6c5ce7',
      tabBarInactiveTintColor: '#9ca3af',
    }}>
      <Tab.Screen name="Booking" options={{ title: 'Taxi', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🚕</Text> }}>
        {() => <BookingScreen />}
      </Tab.Screen>
      <Tab.Screen name="History" options={{ title: 'Tarix', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }}>
        {() => <TripsHistoryScreen />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}>
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('passenger_token').then(t => { setToken(t); setLoading(false); });
  }, []);

  const handleLogin = async (newToken) => {
    await AsyncStorage.setItem('passenger_token', newToken);
    setToken(newToken);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['passenger_token', 'passenger_data']);
    setToken(null);
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login">{() => <LoginScreen onLogin={handleLogin} />}</Stack.Screen>
            <Stack.Screen name="Register">{() => <RegisterScreen onLogin={handleLogin} />}</Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Main">{() => <TabNavigator onLogout={handleLogout} />}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
