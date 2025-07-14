import { Link } from "expo-router";
import React, { useState } from "react";
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

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Input validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await register(email, password, name);
    } catch (err) {
      // Handle backend error codes
      if (err.code === 400 && err.message?.toLowerCase().includes('exists')) {
        setError("An account with this email already exists");
      } else if (err.code === 400) {
        setError("Invalid registration details");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
      console.error("Registration error:", err);
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
          Create Account
        </Text>
        <Text style={{ 
          color: SUBTLE, 
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 22
        }}>
          Join Murai to get started
        </Text>
      </View>

      {/* Form Section */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ gap: 20, marginBottom: 24 }}>
          <AppInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            style={{ marginBottom: 16 }}
          />

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
              backgroundColor: `${ERROR}15`,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: ERROR
            }}>
              <Text style={{ 
                color: ERROR,
                fontSize: 14,
                fontWeight: '500'
              }}>
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Create Account Button */}
        <AppButton
          title={loading ? "Signing Up..." : "Sign Up"}
          onPress={handleRegister}
          loading={loading}
          style={{ marginBottom: 16 }}
        />

        {/* Sign In Link */}
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
            Already have an account?
          </Text>
          <Link href="/(auth)/login" style={{ 
            color: ACCENT,
            fontSize: 15,
            fontWeight: '600'
          }}>
            Sign In
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