import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { appwriteService } from "../services/appwrite";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";
const ERROR = "#ef4444";
const WARNING = "#f59e0b";

// Cooldown time in seconds
const RATE_LIMIT_COOLDOWN = 60;

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      
      // Try to get current user first to check if already logged in
      const currentUser = await appwriteService.getCurrentUser();
      if (currentUser) {
        console.log('⚠️ Found existing session, cleaning up...');
        await appwriteService.logout();
      }

      await login(email.trim(), password);
      console.log('✅ Login successful, navigating to app...');
      router.replace('/(app)');
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

  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={{ color: TEXT, fontSize: 28, fontWeight: "bold" }}>
          Welcome Back
        </Text>
        <Text style={{ color: SUBTLE, marginTop: 8 }}>
          Sign in to continue to Murai
        </Text>
      </View>

      <LinearGradient
        colors={[CARD_BG, `${CARD_BG}cc`]}
        style={{
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ color: SUBTLE, marginBottom: 8 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase());
                setError("");
              }}
              placeholder="Enter your email"
              placeholderTextColor={SUBTLE}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading && cooldownTime === 0}
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
                opacity: (loading || cooldownTime > 0) ? 0.7 : 1,
              }}
            />
          </View>

          <View>
            <Text style={{ color: SUBTLE, marginBottom: 8 }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              placeholder="Enter your password"
              placeholderTextColor={SUBTLE}
              secureTextEntry
              autoComplete="password"
              editable={!loading && cooldownTime === 0}
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
                opacity: (loading || cooldownTime > 0) ? 0.7 : 1,
              }}
            />
          </View>

          {error ? (
            <View style={{ 
              backgroundColor: cooldownTime > 0 ? `${WARNING}22` : `${ERROR}22`,
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: cooldownTime > 0 ? WARNING : ERROR
            }}>
              <Text style={{ 
                color: cooldownTime > 0 ? WARNING : ERROR,
                marginBottom: cooldownTime > 0 ? 4 : 0
              }}>
                {error}
              </Text>
              {cooldownTime > 0 && (
                <Text style={{ color: WARNING, fontSize: 12 }}>
                  Try again in {cooldownTime} seconds
                </Text>
              )}
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading || cooldownTime > 0}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
          opacity: (loading || cooldownTime > 0) ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={BG} />
        ) : (
          <Text style={{ color: BG, fontWeight: "bold", fontSize: 16 }}>
            {cooldownTime > 0 ? `Try again in ${cooldownTime}s` : "Sign In"}
          </Text>
        )}
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Text style={{ color: SUBTLE }}>Don&apos;t have an account?</Text>
        <Link href="/(auth)/register" style={{ color: ACCENT }}>
          Sign Up
        </Link>
      </View>

      <Link href="/(auth)/test" style={{ 
        color: SUBTLE,
        textAlign: "center",
        marginTop: 20,
        textDecorationLine: "underline"
      }}>
        Test Connection
      </Link>
    </View>
  );
} 