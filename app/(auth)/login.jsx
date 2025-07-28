import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

      // Handle specific Appwrite error codes
      if (err.message?.includes('Rate limit')) {
        setError(`Too many login attempts. Please wait ${RATE_LIMIT_COOLDOWN} seconds.`);
        setCooldownTime(RATE_LIMIT_COOLDOWN);
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
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="shield-check" size={40} color="#02B97F" />
        </View>
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
            placeholder="Enter your password"
            secureTextEntry
            style={[styles.input, passwordError ? styles.inputError : null]}
          />
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

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By signing in, you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink} onPress={() => setShowPrivacyModal(true)}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms of Service</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                <Text style={styles.modalSectionTitle}>1. Acceptance of Terms</Text>{'\n'}
                By accessing and using MURAi, you accept and agree to be bound by the terms and provision of this agreement.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>2. Use License</Text>{'\n'}
                Permission is granted to temporarily download one copy of the app per device for personal, non-commercial transitory viewing only.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>3. Digital Safety Protection</Text>{'\n'}
                MURAi provides digital safety monitoring and protection services. While we strive to maintain high accuracy, we cannot guarantee 100% detection of all threats.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>4. User Responsibilities</Text>{'\n'}
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>5. Privacy and Data</Text>{'\n'}
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>6. Service Modifications</Text>{'\n'}
                We reserve the right to modify or discontinue the service at any time without notice.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>7. Limitation of Liability</Text>{'\n'}
                MURAi shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>8. Contact Information</Text>{'\n'}
                If you have any questions about these Terms of Service, please contact us at support@murai.com
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                <Text style={styles.modalSectionTitle}>1. Information We Collect</Text>{'\n'}
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>2. How We Use Your Information</Text>{'\n'}
                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>3. Digital Safety Monitoring</Text>{'\n'}
                Our service monitors digital content for safety purposes. This may include analyzing text content to identify potential threats or inappropriate material.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>4. Data Security</Text>{'\n'}
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>5. Information Sharing</Text>{'\n'}
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>6. Data Retention</Text>{'\n'}
                We retain your information for as long as necessary to provide our services and comply with legal obligations.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>7. Your Rights</Text>{'\n'}
                You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
                {'\n\n'}
                <Text style={styles.modalSectionTitle}>8. Contact Us</Text>{'\n'}
                If you have questions about this Privacy Policy, please contact us at privacy@murai.com
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  termsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  termsText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#02B97F',
    fontFamily: 'Poppins-SemiBold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 22,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 8,
  },
});