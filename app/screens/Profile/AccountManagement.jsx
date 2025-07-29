import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from '../../services/api';

export default function AccountManagement() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [originalData, setOriginalData] = useState({ name: "", email: "", phone: "" });
  const [editingField, setEditingField] = useState(null); // 'name', 'email', 'phone', or null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Password visibility states
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Password validation states
  const [pwValidation, setPwValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get('/users/me');
        const userData = {
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || ""
        };
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setOriginalData(userData);
      } catch (err) {
        setError("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Check for changes
  useEffect(() => {
    const currentData = { name, email, phone };
    const changed = JSON.stringify(currentData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [name, email, phone, originalData]);

  // Password validation effect
  useEffect(() => {
    const validatePassword = (password) => {
      return {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        passwordsMatch: password === confirmPw && password.length > 0
      };
    };

    if (newPw || confirmPw) {
      setPwValidation(validatePassword(newPw));
    } else {
      setPwValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false
      });
    }
  }, [newPw, confirmPw]);

  // Handle field editing
  const handleEditField = (field) => {
    console.log('Editing field:', field);
    setError(""); // Clear any existing errors
    setEditingField(field);
  };

  const handleCancelField = (field) => {
    // Reset specific field to original value
    switch (field) {
      case 'name':
        setName(originalData.name);
        break;
      case 'email':
        setEmail(originalData.email);
        break;
      case 'phone':
        setPhone(originalData.phone);
        break;
    }
    setEditingField(null);
    setError("");
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setName(originalData.name);
    setEmail(originalData.email);
    setPhone(originalData.phone);
    setEditingField(null);
    setError("");
  };

  const handleSaveField = async (field) => {
    console.log('Saving field:', field);
    // Validate field before saving
    let fieldValue = '';
    switch (field) {
      case 'name':
        fieldValue = name.trim();
        if (!fieldValue) {
          setError("Name cannot be empty");
          return;
        }
        break;
      case 'email':
        fieldValue = email.trim();
        if (!fieldValue) {
          setError("Email cannot be empty");
          return;
        }
        if (!/\S+@\S+\.\S+/.test(fieldValue)) {
          setError("Please enter a valid email address");
          return;
        }
        break;
      case 'phone':
        fieldValue = phone.trim();
        if (!fieldValue) {
          setError("Phone number cannot be empty");
          return;
        }
        break;
    }

    setSaving(true);
    setError("");
    try {
      const updateData = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      console.log('Sending update data:', updateData);

      const response = await api.put('/users/me', updateData);
      console.log('Update response:', response.data);

      // Update original data to new values
      setOriginalData(updateData);
      setEditingField(null);
      Alert.alert("Success", `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (err) {
      console.error('Save field error:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);

      const errorMessage = err?.response?.data?.message || `Failed to update ${field}`;
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    // Validate all fields
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }
    if (!trimmedEmail) {
      setError("Email cannot be empty");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!trimmedPhone) {
      setError("Phone number cannot be empty");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updateData = { name: trimmedName, email: trimmedEmail, phone: trimmedPhone };
      console.log('Sending save all data:', updateData);

      const response = await api.put('/users/me', updateData);
      console.log('Save all response:', response.data);

      // Update state with trimmed values
      setName(trimmedName);
      setEmail(trimmedEmail);
      setPhone(trimmedPhone);
      setOriginalData(updateData);
      setEditingField(null);

      Alert.alert("Success", "Account information updated successfully");
    } catch (err) {
      console.error('Save all error:', err);
      console.error('Error response:', err?.response?.data);
      console.error('Error status:', err?.response?.status);

      const errorMessage = err?.response?.data?.message || "Failed to update account info";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            setSaving(true);
            setError("");
            try {
              await api.delete('/users/me');
              Alert.alert("Account Deleted", "Your account has been deleted.");
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err) {
              setError("Failed to delete account");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    // Validate all fields are filled
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required");
      return;
    }

    // Validate password requirements
    if (!pwValidation.minLength) {
      setPwError("New password must be at least 8 characters long");
      return;
    }
    if (!pwValidation.hasUppercase) {
      setPwError("New password must contain at least one uppercase letter");
      return;
    }
    if (!pwValidation.hasLowercase) {
      setPwError("New password must contain at least one lowercase letter");
      return;
    }
    if (!pwValidation.hasNumber) {
      setPwError("New password must contain at least one number");
      return;
    }
    if (!pwValidation.hasSpecialChar) {
      setPwError("New password must contain at least one special character");
      return;
    }
    if (!pwValidation.passwordsMatch) {
      setPwError("New passwords do not match");
      return;
    }

    // Check if new password is same as current
    if (currentPw === newPw) {
      setPwError("New password must be different from current password");
      return;
    }

    setPwLoading(true);
    try {
      const response = await api.post('/users/change-password', {
        currentPassword: currentPw,
        newPassword: newPw
      });

      setPwSuccess("Password updated successfully!");

      // Clear form and close modal after success
      setTimeout(() => {
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setShowCurrentPw(false);
        setShowNewPw(false);
        setShowConfirmPw(false);
        setPwModalVisible(false);
        setPwSuccess("");
        setPwError("");
      }, 1500);

    } catch (err) {
      console.error('Change password error:', err);
      const errorMessage = err?.response?.data?.message || "Failed to change password";
      setPwError(errorMessage);
    } finally {
      setPwLoading(false);
    }
  };

  // Reset password modal state when closing
  const handleClosePasswordModal = () => {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setPwError("");
    setPwSuccess("");
    setPwModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#01B97F" />
        <Text style={styles.loadingText}>Loading account information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Management</Text>
          {hasChanges ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Feather name="x" size={20} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <Feather name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderButton} />
          )}
        </View>

        {/* Error Message */}
        {!!error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Account Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[styles.inputContainer, editingField === 'name' && styles.inputContainerActive]}>
              <Feather name="user" size={16} color="#A8AAB0" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={editingField === 'name'}
                placeholder="Enter your full name"
                placeholderTextColor="#A8AAB0"
                onFocus={() => {
                  if (editingField !== 'name') {
                    handleEditField('name');
                  }
                }}
                autoFocus={editingField === 'name'}
              />
              {editingField === 'name' ? (
                <View style={styles.fieldActions}>
                  <TouchableOpacity
                    style={styles.fieldCancelBtn}
                    onPress={() => handleCancelField('name')}
                  >
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fieldSaveBtn}
                    onPress={() => handleSaveField('name')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Feather name="check" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editFieldBtn}
                  onPress={() => handleEditField('name')}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={16} color="#01B97F" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, editingField === 'email' && styles.inputContainerActive]}>
              <Feather name="mail" size={16} color="#A8AAB0" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={editingField === 'email'}
                placeholder="Enter your email"
                placeholderTextColor="#A8AAB0"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => {
                  if (editingField !== 'email') {
                    handleEditField('email');
                  }
                }}
                autoFocus={editingField === 'email'}
              />
              {editingField === 'email' ? (
                <View style={styles.fieldActions}>
                  <TouchableOpacity
                    style={styles.fieldCancelBtn}
                    onPress={() => handleCancelField('email')}
                  >
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fieldSaveBtn}
                    onPress={() => handleSaveField('email')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Feather name="check" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editFieldBtn}
                  onPress={() => handleEditField('email')}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={16} color="#01B97F" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputContainer, editingField === 'phone' && styles.inputContainerActive]}>
              <Feather name="phone" size={16} color="#A8AAB0" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                editable={editingField === 'phone'}
                placeholder="Enter your phone number"
                placeholderTextColor="#A8AAB0"
                keyboardType="phone-pad"
                onFocus={() => {
                  if (editingField !== 'phone') {
                    handleEditField('phone');
                  }
                }}
                autoFocus={editingField === 'phone'}
              />
              {editingField === 'phone' ? (
                <View style={styles.fieldActions}>
                  <TouchableOpacity
                    style={styles.fieldCancelBtn}
                    onPress={() => handleCancelField('phone')}
                  >
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fieldSaveBtn}
                    onPress={() => handleSaveField('phone')}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size={14} color="#fff" />
                    ) : (
                      <Feather name="check" size={14} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.editFieldBtn}
                  onPress={() => handleEditField('phone')}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={16} color="#01B97F" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Security Actions Card */}
        <View style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Feather name="shield" size={20} color="#01B97F" />
            <Text style={styles.cardTitle}>Security</Text>
          </View>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setPwModalVisible(true)}
          >
            <View style={styles.actionLeft}>
              <Feather name="lock" size={20} color="#A8AAB0" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Change Password</Text>
                <Text style={styles.actionSubtext}>Update your account password</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#A8AAB0" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone Card */}
        <View style={styles.dangerCard}>
          <View style={styles.cardHeader}>
            <Feather name="alert-triangle" size={20} color="#EF4444" />
            <Text style={styles.dangerTitle}>Danger Zone</Text>
          </View>

          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.actionLeft}>
              <Feather name="trash-2" size={20} color="#EF4444" />
              <View style={styles.actionContent}>
                <Text style={styles.dangerText}>Delete Account</Text>
                <Text style={styles.dangerSubtext}>Permanently delete your account and all data</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={pwModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClosePasswordModal}
      >
        <View style={styles.pwModalOverlay}>
          <View style={styles.pwModalContent}>
            <View style={styles.modalHeader}>
              <Feather name="lock" size={24} color="#01B97F" />
              <Text style={styles.pwModalTitle}>Change Password</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={16} color="#A8AAB0" />
                <TextInput
                  style={styles.pwInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#A8AAB0"
                  secureTextEntry={!showCurrentPw}
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  editable={!pwLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPw(!showCurrentPw)}
                >
                  <Feather
                    name={showCurrentPw ? "eye-off" : "eye"}
                    size={16}
                    color="#A8AAB0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputContainer}>
                <Feather name="key" size={16} color="#A8AAB0" />
                <TextInput
                  style={styles.pwInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#A8AAB0"
                  secureTextEntry={!showNewPw}
                  value={newPw}
                  onChangeText={setNewPw}
                  editable={!pwLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPw(!showNewPw)}
                >
                  <Feather
                    name={showNewPw ? "eye-off" : "eye"}
                    size={16}
                    color="#A8AAB0"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              {newPw.length > 0 && (
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={pwValidation.minLength ? "check-circle" : "circle"}
                        size={14}
                        color={pwValidation.minLength ? "#10B981" : "#A8AAB0"}
                      />
                      <Text style={[
                        styles.requirementText,
                        pwValidation.minLength && styles.requirementMet
                      ]}>
                        At least 8 characters
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={pwValidation.hasUppercase ? "check-circle" : "circle"}
                        size={14}
                        color={pwValidation.hasUppercase ? "#10B981" : "#A8AAB0"}
                      />
                      <Text style={[
                        styles.requirementText,
                        pwValidation.hasUppercase && styles.requirementMet
                      ]}>
                        One uppercase letter
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={pwValidation.hasLowercase ? "check-circle" : "circle"}
                        size={14}
                        color={pwValidation.hasLowercase ? "#10B981" : "#A8AAB0"}
                      />
                      <Text style={[
                        styles.requirementText,
                        pwValidation.hasLowercase && styles.requirementMet
                      ]}>
                        One lowercase letter
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={pwValidation.hasNumber ? "check-circle" : "circle"}
                        size={14}
                        color={pwValidation.hasNumber ? "#10B981" : "#A8AAB0"}
                      />
                      <Text style={[
                        styles.requirementText,
                        pwValidation.hasNumber && styles.requirementMet
                      ]}>
                        One number
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={pwValidation.hasSpecialChar ? "check-circle" : "circle"}
                        size={14}
                        color={pwValidation.hasSpecialChar ? "#10B981" : "#A8AAB0"}
                      />
                      <Text style={[
                        styles.requirementText,
                        pwValidation.hasSpecialChar && styles.requirementMet
                      ]}>
                        One special character
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={[
                styles.inputContainer,
                confirmPw.length > 0 && !pwValidation.passwordsMatch && styles.inputError,
                confirmPw.length > 0 && pwValidation.passwordsMatch && styles.inputSuccess
              ]}>
                <Feather
                  name="check-circle"
                  size={16}
                  color={
                    confirmPw.length > 0 && pwValidation.passwordsMatch
                      ? "#10B981"
                      : "#A8AAB0"
                  }
                />
                <TextInput
                  style={styles.pwInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#A8AAB0"
                  secureTextEntry={!showConfirmPw}
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  editable={!pwLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPw(!showConfirmPw)}
                >
                  <Feather
                    name={showConfirmPw ? "eye-off" : "eye"}
                    size={16}
                    color="#A8AAB0"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPw.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Feather
                    name={pwValidation.passwordsMatch ? "check-circle" : "x-circle"}
                    size={14}
                    color={pwValidation.passwordsMatch ? "#10B981" : "#EF4444"}
                  />
                  <Text style={[
                    styles.matchText,
                    pwValidation.passwordsMatch ? styles.matchSuccess : styles.matchError
                  ]}>
                    {pwValidation.passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </Text>
                </View>
              )}
            </View>

            {!!pwError && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.pwError}>{pwError}</Text>
              </View>
            )}
            {!!pwSuccess && (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={styles.pwSuccess}>{pwSuccess}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.pwBtn, styles.cancelBtn]}
                onPress={handleClosePasswordModal}
                disabled={pwLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pwBtn,
                  styles.confirmBtn,
                  (!pwValidation.minLength || !pwValidation.hasUppercase ||
                   !pwValidation.hasLowercase || !pwValidation.hasNumber ||
                   !pwValidation.hasSpecialChar || !pwValidation.passwordsMatch ||
                   !currentPw) && styles.confirmBtnDisabled
                ]}
                onPress={handleChangePassword}
                disabled={pwLoading || !pwValidation.minLength || !pwValidation.hasUppercase ||
                         !pwValidation.hasLowercase || !pwValidation.hasNumber ||
                         !pwValidation.hasSpecialChar || !pwValidation.passwordsMatch || !currentPw}
              >
                {pwLoading ? (
                  <ActivityIndicator color="#fff" size={16} />
                ) : (
                  <>
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.confirmBtnText}>Change</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#01B97F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dangerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  dangerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#EF4444',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6C6C6C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  inputContainerActive: {
    borderColor: '#01B97F',
    backgroundColor: '#F0FDF4',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1D1D1F',
  },
  editFieldBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldCancelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  fieldSaveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#01B97F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
  },
  actionSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
    marginTop: 2,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#EF4444',
  },
  dangerSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#B91C1C',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal Styles
  pwModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pwModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  pwModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  pwInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1D1D1F',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  pwBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  confirmBtn: {
    backgroundColor: '#01B97F',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#ffffff',
  },
  pwError: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    flex: 1,
  },
  pwSuccess: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#10B981',
    flex: 1,
  },
  // Password visibility and validation styles
  eyeButton: {
    padding: 4,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  passwordRequirements: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  requirementMet: {
    color: '#10B981',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  matchSuccess: {
    color: '#10B981',
  },
  matchError: {
    color: '#EF4444',
  },
  confirmBtnDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
});
