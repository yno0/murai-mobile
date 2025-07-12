import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#9ca3af";
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
          <View>
            <Text style={{ 
              color: SUBTLE, 
              marginBottom: 8,
              fontSize: 14,
              fontWeight: '500'
            }}>
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              placeholder="Enter your full name"
              placeholderTextColor={`${SUBTLE}80`}
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 12,
                padding: 16,
                color: TEXT,
                fontSize: 16,
                borderWidth: 1,
                borderColor: `${SUBTLE}30`,
              }}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text style={{ 
              color: SUBTLE, 
              marginBottom: 8,
              fontSize: 14,
              fontWeight: '500'
            }}>
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase());
                setError("");
              }}
              placeholder="Enter your email"
              placeholderTextColor={`${SUBTLE}80`}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 12,
                padding: 16,
                color: TEXT,
                fontSize: 16,
                borderWidth: 1,
                borderColor: `${SUBTLE}30`,
              }}
            />
          </View>

          <View>
            <Text style={{ 
              color: SUBTLE, 
              marginBottom: 8,
              fontSize: 14,
              fontWeight: '500'
            }}>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              placeholder="Choose a strong password (min. 8 characters)"
              placeholderTextColor={`${SUBTLE}80`}
              secureTextEntry
              autoComplete="new-password"
              style={{
                backgroundColor: CARD_BG,
                borderRadius: 12,
                padding: 16,
                color: TEXT,
                fontSize: 16,
                borderWidth: 1,
                borderColor: `${SUBTLE}30`,
              }}
            />
          </View>

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
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: ACCENT,
            borderRadius: 12,
            padding: 18,
            alignItems: "center",
            marginBottom: 24,
            opacity: loading ? 0.7 : 1,
            shadowColor: ACCENT,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={BG} size="small" />
          ) : (
            <Text style={{ 
              color: BG, 
              fontWeight: "600", 
              fontSize: 16,
              letterSpacing: 0.5
            }}>
              Create Account
            </Text>
          )}
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