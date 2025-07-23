import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import { COLORS, globalStyles } from "../../constants/theme";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // TODO: Implement registration logic
    console.log("Register attempt:", { name, email });
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: "center", marginTop: 60, marginBottom: 40 }}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Text style={{ 
          color: COLORS.TEXT_MAIN, 
          fontSize: 28, 
          fontFamily: "Poppins-Bold" 
        }}>
          Create Account
        </Text>
        <Text style={{ 
          color: COLORS.TEXT_MUTED, 
          marginTop: 8,
          fontFamily: "Poppins-Regular"
        }}>
          Join Murai to get started
        </Text>
      </View>

      <View style={globalStyles.card}>
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
      </View>

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
        <Text style={{ color: COLORS.TEXT_MUTED, fontFamily: "Poppins-Regular" }}>Already have an account?</Text>
        <Link href="/login" style={{ color: COLORS.PRIMARY, fontFamily: "Poppins-SemiBold" }}>
          Sign In
        </Link>
      </View>
    </View>
  );
} 