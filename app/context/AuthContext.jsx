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
      // Mock user check - you can replace this with your own auth logic
      const storedUser = localStorage.getItem('user');
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

  const API_BASE_URL = 'http://localhost:3000/api'; // Adjust if needed

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
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ email }));
      setUser({ email });
      router.replace('/(app)');
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
      // Registration step 1: OTP sent, redirect to login or OTP page
      router.replace('/(auth)/login');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Mock logout
      localStorage.removeItem('user');
      setUser(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
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