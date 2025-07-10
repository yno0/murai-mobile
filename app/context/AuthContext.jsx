import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { appwriteService } from "../services/appwrite";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await appwriteService.getCurrentUser();
      setUser(currentUser);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const session = await appwriteService.login(email, password);
      if (session) {
        const currentUser = await appwriteService.getCurrentUser();
        setUser(currentUser);
        router.replace("/(app)");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      // Always log out before registering a new account
      try {
        await appwriteService.logout();
      } catch (_logoutError) {
        // Ignore logout errors (e.g., if not logged in)
      }
      // First create the account
      await appwriteService.createAccount(email, password, name);
      // After registration, redirect to login page
      router.replace("/(auth)/login");
      // No error thrown here; registration is successful
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await appwriteService.logout();
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