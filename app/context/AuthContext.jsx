import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Use AsyncStorage for React Native
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const API_BASE_URL = 'https://murai-server.onrender.com/api'; // Deployed server

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw { code: response.status, message: data.message || 'Login failed' };
      }
      // Store token and user info in AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      // Do not redirect here; let the login screen handle it
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword: password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw { code: response.status, message: data.message || 'Registration failed' };
      }

      // Registration successful - user is automatically logged in
      // Store token and user info in AsyncStorage
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      // Redirect to main app
      router.replace('/(app)');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔄 AuthContext logout function called');
    try {
      // Get current user role and token before clearing storage
      const currentUser = user || JSON.parse(await AsyncStorage.getItem('user') || 'null');
      const token = await AsyncStorage.getItem('token');
      console.log('📋 Current user:', currentUser);
      console.log('🔑 Token exists:', !!token);

      // Optional: Notify server about logout (if API endpoint exists)
      if (token) {
        try {
          console.log('🔄 Notifying server about logout...');
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Server logout notification successful');
        } catch (apiError) {
          console.warn('⚠️ Server logout notification failed:', apiError);
          // Continue with local logout even if server notification fails
        }
      }

      // Clear all authentication data
      console.log('🔄 Clearing storage...');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken'); // Clear refresh token if exists

      // Clear user state
      console.log('🔄 Clearing user state...');
      setUser(null);

      // Redirect to login (same for both admin and regular users)
      console.log('🔄 Redirecting to login...');
      router.replace("/(auth)/login");

      console.log('✅ Logout successful');
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Fallback: still redirect to login even if there's an error
      console.log('🔄 Fallback redirect to login...');
      router.replace("/(auth)/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;