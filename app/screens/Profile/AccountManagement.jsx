import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/common/Header';
import api from '../../services/api';

export default function AccountManagement() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get('/users/me');
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      } catch (err) {
        setError("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError("");
    api.put('/users/me', { name, email, phone })
      .then(() => {
        setIsEditing(false);
        Alert.alert("Success", "Account information updated successfully");
      })
      .catch(() => {
        setError("Failed to update account info");
      })
      .finally(() => setSaving(false));
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
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/users/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess("Password updated successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setPwModalVisible(false); setPwSuccess(""); }, 1200);
    } catch (err) {
      setPwError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header 
          title="Account Management"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon={isEditing ? "check" : "pencil"}
          rightIconType="material"
          onRightPress={() => isEditing ? handleSave() : setIsEditing(true)}
          style={{ paddingHorizontal: 0 }}
        />

      {!!error && (
        <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={isEditing}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            placeholder="Enter your phone number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        
        <TouchableOpacity 
          style={styles.dangerItem}
          onPress={handleDeleteAccount}
        >
          <View style={styles.actionLeft}>
            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
            <View>
              <Text style={styles.dangerText}>Delete Account</Text>
              <Text style={styles.dangerSubtext}>Permanently delete your account and all data</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={pwModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPwModalVisible(false)}
      >
        <View style={styles.pwModalOverlay}>
          <View style={styles.pwModalContent}>
            <Text style={styles.pwModalTitle}>Change Password</Text>
            <TextInput
              style={styles.pwInput}
              placeholder="Current Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={currentPw}
              onChangeText={setCurrentPw}
              editable={!pwLoading}
            />
            <TextInput
              style={styles.pwInput}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
              editable={!pwLoading}
            />
            <TextInput
              style={styles.pwInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPw}
              onChangeText={setConfirmPw}
              editable={!pwLoading}
            />
            {!!pwError && <Text style={styles.pwError}>{pwError}</Text>}
            {!!pwSuccess && <Text style={styles.pwSuccess}>{pwSuccess}</Text>}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <TouchableOpacity
                style={[styles.pwBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={() => setPwModalVisible(false)}
                disabled={pwLoading}
              >
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pwBtn, { backgroundColor: '#3B82F6' }]}
                onPress={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Change</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  dangerSubtext: {
    fontSize: 14,
    color: '#B91C1C',
    marginTop: 2,
  },
  pwModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pwModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  pwModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  pwInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    width: '100%',
  },
  pwBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  pwError: {
    color: 'red',
    marginBottom: 4,
    textAlign: 'center',
  },
  pwSuccess: {
    color: '#10B981',
    marginBottom: 4,
    textAlign: 'center',
  },
});
