import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import { COLORS } from "../../constants/theme";

const BG = COLORS.BG;
const CARD_BG = COLORS.CARD_BG;
const ACCENT = COLORS.ACCENT;
const TEXT = COLORS.TEXT_MAIN;
const SUBTLE = COLORS.SUBTLE;

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
        </View>
      </LinearGradient>

      <AppButton
        title="Sign Up"
        onPress={handleRegister}
        style={{ marginBottom: 16 }}
      />

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