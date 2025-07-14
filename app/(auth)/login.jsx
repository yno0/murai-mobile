import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, Text, View } from "react-native";
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
      
      // Check for existing session (mock implementation)
      console.log('🔄 Starting login process...');

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
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      
      {/* Header Section */}
      <View style={{ 
        alignItems: "center", 
        paddingTop: 80, 
        paddingBottom: 48,
        paddingHorizontal: 24
      }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 100, height: 100, marginBottom: 24 }}
          resizeMode="contain"
        />
        <Text style={{ 
          color: TEXT, 
          fontSize: 32, 
          fontWeight: "700",
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Welcome Back
        </Text>
        <Text style={{ 
          color: SUBTLE, 
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 22
        }}>
          Sign in to continue to Murai
        </Text>
      </View>

      {/* Form Section */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ gap: 20, marginBottom: 24 }}>
          <AppInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />

          <AppInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            style={{ marginBottom: 16 }}
          />

          {error ? (
            <View style={{ 
              backgroundColor: cooldownTime > 0 ? `${WARNING}15` : `${ERROR}15`,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: cooldownTime > 0 ? WARNING : ERROR
            }}>
              <Text style={{ 
                color: cooldownTime > 0 ? WARNING : ERROR,
                marginBottom: cooldownTime > 0 ? 6 : 0,
                fontSize: 14,
                fontWeight: '500'
              }}>
                {error}
              </Text>
              {cooldownTime > 0 && (
                <Text style={{ 
                  color: WARNING, 
                  fontSize: 13,
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

        {/* Sign Up Link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginBottom: 32,
          }}
        >
          <Text style={{ 
            color: SUBTLE,
            fontSize: 15
          }}>
            Don&apos;t have an account?
          </Text>
          <Link href="/(auth)/register" style={{ 
            color: ACCENT,
            fontSize: 15,
            fontWeight: '600'
          }}>
            Sign Up
          </Link>
        </View>

        {/* Test Connection Link */}
        <Link href="/(auth)/test" style={{ 
          color: SUBTLE,
          textAlign: "center",
          fontSize: 14,
          textDecorationLine: "underline",
          opacity: 0.7
        }}>
          Test Connection
        </Link>
      </View>
    </View>
  );
} 