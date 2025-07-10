import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";
const ERROR = "#ef4444";
const WARNING = "#f59e0b";

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
      // Handle specific Appwrite error codes
      if (err.code === 400) {
        setError("Invalid email or password format");
      } else if (err.code === 409) {
        setError("An account with this email already exists");
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
    <View style={{ flex: 1, backgroundColor: BG, padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={{ color: TEXT, fontSize: 28, fontWeight: "bold" }}>
          Create Account
        </Text>
        <Text style={{ color: SUBTLE, marginTop: 8 }}>
          Join Murai to get started
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
            <Text style={{ color: SUBTLE, marginBottom: 8 }}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              placeholder="Enter your full name"
              placeholderTextColor={SUBTLE}
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
              }}
              autoCapitalize="words"
            />
          </View>

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
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
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
              placeholder="Choose a strong password (min. 8 characters)"
              placeholderTextColor={SUBTLE}
              secureTextEntry
              autoComplete="new-password"
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
              }}
            />
          </View>

          {error ? (
            <View style={{ 
              backgroundColor: `${ERROR}22`,
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: ERROR
            }}>
              <Text style={{ color: ERROR }}>{error}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={BG} />
        ) : (
          <Text style={{ color: BG, fontWeight: "bold", fontSize: 16 }}>
            Create Account
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
        <Text style={{ color: SUBTLE }}>Already have an account?</Text>
        <Link href="/(auth)/login" style={{ color: ACCENT }}>
          Sign In
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