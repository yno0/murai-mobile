import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const MainHeader = require('../../../components/common/MainHeader').default;

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     currentPassword: formData.currentPassword,
      //     newPassword: formData.newPassword
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to change password');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderPasswordField = (
    label,
    value,
    onChangeText,
    placeholder,
    field,
    error
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!showPasswords[field]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => togglePasswordVisibility(field)}
        >
          <Feather
            name={showPasswords[field] ? 'eye-off' : 'eye'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '#E5E7EB' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const strengthMap = {
      0: { label: 'Very Weak', color: '#EF4444' },
      1: { label: 'Weak', color: '#F59E0B' },
      2: { label: 'Fair', color: '#F59E0B' },
      3: { label: 'Good', color: '#10B981' },
      4: { label: 'Strong', color: '#059669' },
      5: { label: 'Very Strong', color: '#047857' },
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <View style={styles.container}>
      <MainHeader
        title="Change Password"
        subtitle="Update your account password"
        leftActions={[
          {
            icon: 'arrow-left',
            iconType: 'feather',
            onPress: () => navigation.goBack()
          }
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Security Notice */}
          <View style={styles.noticeContainer}>
            <Feather name="shield" size={20} color="#01B97F" />
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Security Requirements</Text>
              <Text style={styles.noticeText}>
                Your new password must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers.
              </Text>
            </View>
          </View>

          {/* Current Password */}
          {renderPasswordField(
            'Current Password',
            formData.currentPassword,
            (text) => setFormData(prev => ({ ...prev, currentPassword: text })),
            'Enter your current password',
            'current',
            errors.currentPassword
          )}

          {/* New Password */}
          {renderPasswordField(
            'New Password',
            formData.newPassword,
            (text) => setFormData(prev => ({ ...prev, newPassword: text })),
            'Enter your new password',
            'new',
            errors.newPassword
          )}

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          {renderPasswordField(
            'Confirm New Password',
            formData.confirmPassword,
            (text) => setFormData(prev => ({ ...prev, confirmPassword: text })),
            'Confirm your new password',
            'confirm',
            errors.confirmPassword
          )}

          {/* Change Password Button */}
          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.changeButtonText}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingTop: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f5f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#01B97F',
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#047857',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#065f46',
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  eyeButton: {
    padding: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'right',
  },
  changeButton: {
    backgroundColor: '#01B97F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  changeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  changeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 40,
  },
});
