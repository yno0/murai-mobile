import { Link } from "expo-router";
import React, { useState } from "react";
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

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setGoogleLoading(true);
      console.log('🔄 Starting Google registration...');
      
      // TODO: Implement Google OAuth registration
      // await registerWithGoogle();
      
      console.log('✅ Google registration successful');
    } catch (err) {
      console.error('❌ Google registration error:', err);
      setError("Google sign-up failed. Please try again.");
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
          Create Account
        </Text>
        <Text style={{ 
          color: '#6B7280', 
          fontSize: 16,
          fontFamily: 'Poppins-Regular',
          textAlign: 'center',
          lineHeight: 22
        }}>
          Join MURAi to get started
        </Text>
      </View>

      {/* Form Section */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ gap: 16, marginBottom: 24 }}>
          <AppInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            style={{ marginBottom: 0 }}
          />

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
              backgroundColor: `${ERROR}10`,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${ERROR}30`
            }}>
              <Text style={{ 
                color: ERROR,
                fontSize: 14,
                fontFamily: 'Poppins-Medium'
              }}>
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Create Account Button */}
        <AppButton
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
          loading={loading}
          style={{ marginBottom: 16 }}
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

        {/* Google Sign Up Button */}
        <TouchableOpacity
          onPress={handleGoogleRegister}
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
            {googleLoading ? "Creating account..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

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
            color: '#6B7280',
            fontSize: 15,
            fontFamily: 'Poppins-Regular'
          }}>
            Already have an account?
          </Text>
          <Link href="/(auth)/login" style={{ 
            color: ACCENT,
            fontSize: 15,
            fontFamily: 'Poppins-Medium'
          }}>
            Sign In
          </Link>
        </View>
      </View>
    </View>
  );
} 