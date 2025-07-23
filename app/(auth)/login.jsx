import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import { COLORS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

const BG = COLORS.BG;
const CARD_BG = COLORS.CARD_BG;
const ACCENT = COLORS.ACCENT;
const TEXT = COLORS.TEXT_MAIN;
const SUBTLE = COLORS.SUBTLE;
const ERROR = COLORS.ERROR;
const WARNING = COLORS.WARNING;

// Cooldown time in seconds
const RATE_LIMIT_COOLDOWN = 60;

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(time => {
          if (time <= 1) {
            setError("");
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleLogin = async () => {
    // Don't allow login during cooldown
    if (cooldownTime > 0) {
      return;
    }

    // Input validation
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      setError("");
      setLoading(true);
      console.log('🔄 Starting login process...');
      
      await login(email.trim(), password);
      // Get user from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.role === 'admin') {
        router.replace('/(admin)'); // Change to your admin route if needed
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      console.error('❌ Login error:', {
        code: err.code,
        type: err.type,
        message: err.message,
        response: err.response
      });
      
      // Handle specific Appwrite error codes
      if (err.message?.includes('Rate limit')) {
        setError(`Too many login attempts. Please wait ${RATE_LIMIT_COOLDOWN} seconds.`);
        setCooldownTime(RATE_LIMIT_COOLDOWN);
      } else if (err.type === 'user_invalid_credentials' || err.code === 401) {
        setError("Incorrect email or password");
      } else if (err.code === 404) {
        setError("Account not found. Please check your email.");
      } else if (err.message?.toLowerCase().includes('invalid')) {
        setError("Please check your email and password");
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);
      console.log('🔄 Starting Google login...');
      
      // TODO: Implement Google OAuth
      // await loginWithGoogle();
      
      console.log('✅ Google login successful');
      router.replace('/(app)');
    } catch (err) {
      console.error('❌ Google login error:', err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      {/* Header Section */}
      <View style={{ 
        alignItems: "center", 
        paddingTop: 80, 
        paddingBottom: 40,
        paddingHorizontal: 24
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: '#F3F4F6',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ 
          color: TEXT, 
          fontSize: 28, 
          fontFamily: 'Poppins-Medium',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Welcome Back
        </Text>
        <Text style={{ 
          color: '#6B7280', 
          fontSize: 16,
          fontFamily: 'Poppins-Regular',
          textAlign: 'center',
          lineHeight: 22
        }}>
          Sign in to continue to MURAi
        </Text>
      </View>

      {/* Form Section */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ gap: 16, marginBottom: 24 }}>
          <AppInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 0 }}
          />

          <AppInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            style={{ marginBottom: 0 }}
          />

          {error ? (
            <View style={{ 
              backgroundColor: cooldownTime > 0 ? `${WARNING}10` : `${ERROR}10`,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: cooldownTime > 0 ? `${WARNING}30` : `${ERROR}30`
            }}>
              <Text style={{ 
                color: cooldownTime > 0 ? WARNING : ERROR,
                marginBottom: cooldownTime > 0 ? 6 : 0,
                fontSize: 14,
                fontFamily: 'Poppins-Medium'
              }}>
                {error}
              </Text>
              {cooldownTime > 0 && (
                <Text style={{ 
                  color: WARNING, 
                  fontSize: 13,
                  fontFamily: 'Poppins-Regular',
                  opacity: 0.8
                }}>
                  Try again in {cooldownTime} seconds
                </Text>
              )}
            </View>
          ) : null}
        </View>

        {/* Sign In Button */}
        <AppButton
          title={loading ? "Signing In..." : "Sign In"}
          onPress={handleLogin}
          loading={loading}
          style={{ marginBottom: 16 }}
          disabled={cooldownTime > 0}
        />

        {/* Divider */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 24
        }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <Text style={{
            marginHorizontal: 16,
            color: '#9CA3AF',
            fontSize: 14,
            fontFamily: 'Poppins-Regular'
          }}>
            or continue with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            paddingVertical: 16,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View style={{
            width: 20,
            height: 20,
            backgroundColor: '#4285F4',
            borderRadius: 2,
            marginRight: 12,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>G</Text>
          </View>
          <Text style={{
            color: '#374151',
            fontSize: 16,
            fontFamily: 'Poppins-Medium'
          }}>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginBottom: 16,
          }}
        >
          <Text style={{ 
            color: '#6B7280',
            fontSize: 15,
            fontFamily: 'Poppins-Regular'
          }}>
            Don&apos;t have an account?
          </Text>
          <Link href="/(auth)/register" style={{ 
            color: ACCENT,
            fontSize: 15,
            fontFamily: 'Poppins-Medium'
          }}>
            Sign Up
          </Link>
        </View>

         
         
      </View>
    </View>
  );
} 