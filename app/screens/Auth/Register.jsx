import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // TODO: Implement registration logic
    console.log("Register attempt:", { name, email });
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
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={SUBTLE}
              style={{
                backgroundColor: `${BG}cc`,
                borderRadius: 8,
                padding: 12,
                color: TEXT,
              }}
            />
          </View>

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
              placeholder="Choose a strong password"
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
        onPress={handleRegister}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: BG, fontWeight: "bold", fontSize: 16 }}>
          Create Account
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Text style={{ color: SUBTLE }}>Already have an account?</Text>
        <Link href="/login" style={{ color: ACCENT }}>
          Sign In
        </Link>
      </View>
    </View>
  );
} 