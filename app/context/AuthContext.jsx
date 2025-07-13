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

  const login = async (email, password) => {
    try {
      // Mock login - replace with your own auth logic
      const mockUser = {
        $id: 'mock-user-id',
        email: email,
        name: 'Mock User',
        // Add other user properties as needed
      };
      
      // Store user in localStorage (or your preferred storage)
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      router.replace("/(app)");
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      // Mock registration - replace with your own auth logic
      console.log('Mock registration:', { email, password, name });
      
      // After registration, redirect to login page
      router.replace("/(auth)/login");
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