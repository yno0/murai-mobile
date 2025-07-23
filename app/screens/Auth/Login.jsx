import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import { COLORS, globalStyles } from "../../constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login attempt:", { email });
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={{ width: 120, height: 120, marginBottom: 20, opacity: 0.92 }}
          resizeMode="contain"
        />
        <Text style={{ 
          color: COLORS.TEXT_MAIN, 
          fontSize: 32, 
          fontFamily: "Poppins-Bold", 
          letterSpacing: 0.5, 
          marginBottom: 4 
        }}>
          Welcome Back
        </Text>
        <Text style={{ 
          color: COLORS.TEXT_MUTED, 
          fontSize: 16, 
          fontFamily: "Poppins-Regular",
          marginBottom: 8, 
          letterSpacing: 0.2 
        }}>
          Sign in to continue to Murai
        </Text>
        
        {/* Font Test Section */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-Thin",
            marginBottom: 4 
          }}>
            Poppins Thin
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-Light",
            marginBottom: 4 
          }}>
            Poppins Light
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-Regular",
            marginBottom: 4 
          }}>
            Poppins Regular
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-Medium",
            marginBottom: 4 
          }}>
            Poppins Medium
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-SemiBold",
            marginBottom: 4 
          }}>
            Poppins SemiBold
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 14, 
            fontFamily: "Poppins-Bold",
            marginBottom: 4 
          }}>
            Poppins Bold
          </Text>
        </View>
      </View>

      <View style={globalStyles.card}>
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ marginBottom: 18 }}
        />
        <AppInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          style={{ marginBottom: 18 }}
        />
        <View style={{ height: 1, backgroundColor: COLORS.BORDER, marginVertical: 10, borderRadius: 1 }} />
        <AppButton
          title="Sign In"
          onPress={handleLogin}
          style={{ marginBottom: 0, marginTop: 8 }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Text style={{ color: COLORS.TEXT_MUTED, fontFamily: "Poppins-Regular" }}>Don&apos;t have an account?</Text>
        <Link href="/register" style={{ color: COLORS.PRIMARY, fontFamily: "Poppins-SemiBold" }}>
          Sign Up
        </Link>
      </View>
    </View>
  );
} 