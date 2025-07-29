import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useState } from "react";
import { Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
    // Check if agreement is accepted
    if (!agreementAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy to continue");
      return;
    }

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
      console.log('🔄 Starting registration process...');

      await register(name.trim(), email.trim(), password);
      console.log('✅ Registration successful');
    } catch (err) {
      console.error('❌ Registration error:', {
        code: err.code,
        type: err.type,
        message: err.message,
        response: err.response
      });

      // Handle specific Appwrite error codes
      if (err.type === 'user_already_exists' || err.code === 409) {
        setError("An account with this email already exists");
      } else if (err.message?.toLowerCase().includes('invalid')) {
        setError("Please check your information and try again");
      } else if (err.message) {
        setError(`Registration failed: ${err.message}`);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header Section */}
      <View style={styles.header}>
        <Image 
          source={require("../../assets/images/logo.png")} 
          style={styles.logo}
          resizeMode="contain"
        />
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
          <View style={styles.passwordContainer}>
            <AppInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <AppInput
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError("");
              }}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {/* Agreement Checkbox */}
        <View style={styles.agreementContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreementAccepted(!agreementAccepted)}
          >
            <View style={[styles.checkbox, agreementAccepted && styles.checkboxChecked]}>
              {agreementAccepted && (
                <MaterialCommunityIcons name="check" size={16} color="#ffffff" />
              )}
            </View>
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <Text style={styles.agreementLink} onPress={() => setShowTermsModal(true)}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={styles.agreementLink} onPress={() => setShowPrivacyModal(true)}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
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
        disabled={!agreementAccepted}
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
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 0,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#02B97F',
    borderColor: '#02B97F',
  },
  agreementText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  agreementLink: {
    color: '#02B97F',
    textDecorationLine: 'underline',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1f2937',
    marginBottom: 8,
  },
});