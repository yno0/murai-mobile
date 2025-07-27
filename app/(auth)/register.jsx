import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/common/AppButton";
import AppInput from "../components/common/AppInput";
import { COLORS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Enhanced validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

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
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleRegister = async () => {
    // Clear previous errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    // Validate inputs
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(confirmPassword, password);

    if (nameValidation) {
      setNameError(nameValidation);
    }
    if (emailValidation) {
      setEmailError(emailValidation);
    }
    if (passwordValidation) {
      setPasswordError(passwordValidation);
    }
    if (confirmPasswordValidation) {
      setConfirmPasswordError(confirmPasswordValidation);
    }

    // If there are validation errors, don't proceed
    if (nameValidation || emailValidation || passwordValidation || confirmPasswordValidation) {
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="account-plus" size={40} color="#02B97F" />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join MURAi to get started</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <AppInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError("");
            }}
            placeholder="Enter your full name"
            style={[styles.input, nameError ? styles.inputError : null]}
          />
          {nameError ? (
            <Text style={styles.errorText}>{nameError}</Text>
          ) : null}
        </View>

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
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <AppInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
            placeholder="Create a password"
            secureTextEntry
            style={[styles.input, passwordError ? styles.inputError : null]}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <AppInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (confirmPasswordError) setConfirmPasswordError("");
            }}
            placeholder="Confirm your password"
            secureTextEntry
            style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          />
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {error ? (
          <View style={styles.generalErrorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={COLORS.ERROR}
              style={styles.errorIcon}
            />
            <Text style={styles.generalErrorText}>
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
        style={styles.createAccountButton}
      />

      {/* Sign In Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?
        </Text>
        <Link href="/(auth)/login" style={styles.footerLink}>
          Sign In
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
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
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  generalErrorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  createAccountButton: {
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