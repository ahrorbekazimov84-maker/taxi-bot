import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TripsHistoryScreen from './screens/TripsHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2d2d4e',
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#6c5ce7',
        tabBarInactiveTintColor: '#636e72',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: 'Asosiy',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      >
        {() => <HomeScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        options={{
          title: 'Tarix',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      >
        {() => <TripsHistoryScreen />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      >
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🚕</Text>
      <ActivityIndicator color="#6c5ce7" size="large" />
      <Text style={{ color: '#9ca3af', marginTop: 16, fontSize: 14 }}>Yuklanmoqda...</Text>
    </View>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const t = await AsyncStorage.getItem('driver_token');
      setToken(t);
    } catch (e) {
      console.log('Token xatosi:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (newToken) => {
    try {
      await AsyncStorage.setItem('driver_token', newToken);
      setToken(newToken);
    } catch (e) {
      console.log('Login saqlash xatosi:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['driver_token', 'driver_data']);
      setToken(null);
    } catch (e) {
      console.log('Logout xatosi:', e);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Main">
            {() => <TabNavigator onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
