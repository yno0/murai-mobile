import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login attempt:", { email });
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
        <Image
          source={require("../../../assets/images/logo.png")}
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
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={SUBTLE}
              keyboardType="email-address"
              autoCapitalize="none"
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
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={SUBTLE}
              secureTextEntry
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
              }}
            />
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: BG, fontWeight: "bold", fontSize: 16 }}>
          Sign In
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Text style={{ color: SUBTLE }}>Don&apos;t have an account?</Text>
        <Link href="/register" style={{ color: ACCENT }}>
          Sign Up
        </Link>
      </View>
    </View>
  );
} 