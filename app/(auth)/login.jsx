import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import { COLORS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

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
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


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

  // Enhanced validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleLogin = async () => {
    // Don't allow login during cooldown
    if (cooldownTime > 0) {
      return;
    }

    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setError("");

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation) {
      setEmailError(emailValidation);
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
    }

    // If there are validation errors, don't proceed
    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      setError("");
      setLoading(true);
      console.log('🔄 Starting login process...');

      await login(email.trim(), password);
      // Get user from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.role === 'admin') {
        router.replace('/(admin)'); // Change to your admin route if needed
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      console.error('❌ Login error:', {
        code: err.code,
        type: err.type,
        message: err.message,
        response: err.response
      });

      // Handle specific error codes
      if (err.message?.includes('Rate limit')) {
        setError(`Too many login attempts. Please wait ${RATE_LIMIT_COOLDOWN} seconds.`);
        setCooldownTime(RATE_LIMIT_COOLDOWN);
      } else if (err.code === 403) {
        // Account deactivated - ensure user stays on login screen
        setError(err.message || "Your account has been deactivated. Please contact support for assistance.");
        // Clear any stored data for deactivated users
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');  
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => router.push('/(onboarding)')}
          activeOpacity={0.7}
        >
          <Image 
            source={require("../../assets/images/logo.png")} 
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to MURAi</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <AppInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, emailError ? styles.inputError : null]}
            editable={cooldownTime === 0}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordWrapper}>
            <AppInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, passwordError ? styles.inputError : null]}
              editable={cooldownTime === 0}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={cooldownTime > 0}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={cooldownTime > 0 ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {error ? (
          <View style={[styles.generalErrorContainer, cooldownTime > 0 ? styles.warningContainer : null]}>
            <MaterialCommunityIcons
              name={cooldownTime > 0 ? "clock-alert" : "alert-circle"}
              size={20}
              color={cooldownTime > 0 ? COLORS.WARNING : COLORS.ERROR}
              style={styles.errorIcon}
            />
            <View style={styles.errorTextContainer}>
              <Text style={[styles.generalErrorText, cooldownTime > 0 ? styles.warningText : null]}>
                {error}
              </Text>
              {cooldownTime > 0 && (
                <Text style={styles.cooldownText}>
                  Try again in {cooldownTime} seconds
                </Text>
              )}
            </View>
          </View>
        ) : null}
      </View>

      {/* Sign In Button */}
      <AppButton
        title={loading ? "Signing In..." : "Sign In"}
        onPress={handleLogin}
        loading={loading}
        style={styles.signInButton}
        disabled={cooldownTime > 0}
      />

      {/* Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don&apos;t have an account?
        </Text>
        <Link href="/(auth)/register" style={styles.footerLink}>
          Sign Up
        </Link>
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    padding: 12,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 0,
  },
  inputError: {
    borderColor: COLORS.ERROR,
    borderWidth: 1,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 6,
    marginLeft: 4,
  },
  generalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.ERROR}10`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.ERROR}30`,
    marginTop: 10,
  },
  warningContainer: {
    backgroundColor: `${COLORS.WARNING}10`,
    borderColor: `${COLORS.WARNING}30`,
  },
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  errorTextContainer: {
    flex: 1,
  },
  generalErrorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  warningText: {
    color: COLORS.WARNING,
  },
  cooldownText: {
    color: COLORS.WARNING,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
  signInButton: {
    marginHorizontal: 24,
    marginBottom: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 6,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  footerLink: {
    color: '#02B97F',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },

});