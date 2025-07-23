import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

const MainHeader = require('../../../components/common/MainHeader').default;

export default function PersonalDetailsScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // Helper function to get auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, []);

  // Load profile data from API
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading profile data...');
      const profileData = await makeAuthenticatedRequest('/admin/profile');
      console.log('✅ Profile data loaded:', profileData);

      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        department: profileData.department || 'Administration',
        position: profileData.position || 'System Administrator',
        employeeId: profileData.employeeId || '',
        address: profileData.address || '',
        emergencyContact: profileData.emergencyContact || '',
        emergencyPhone: profileData.emergencyPhone || '',
      });
    } catch (error) {
      console.error('❌ Load profile error:', error);
      Alert.alert('Error', error.message || 'Failed to load profile data');

      // Fallback to user data from context
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: 'Administration',
        position: 'System Administrator',
        employeeId: user?.employeeId || '',
        address: user?.address || '',
        emergencyContact: user?.emergencyContact || '',
        emergencyPhone: user?.emergencyPhone || '',
      });
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Validation Error', 'Name and email are required fields');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving profile data...');
      const response = await makeAuthenticatedRequest('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      console.log('✅ Profile saved successfully:', response);

      // Update user context if updateUser function is available
      if (updateUser) {
        updateUser(response.profile);
      }

      Alert.alert('Success', 'Personal details updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Save profile error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile data');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload original data from API
    loadProfile();
    setIsEditing(false);
  };

  const renderField = (label, value, key, editable = true, multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
          placeholder={`Enter ${label.toLowerCase()}`}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || 'Not specified'}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <MainHeader
        title="Personal Details"
        subtitle="Manage your personal and contact information"
        leftActions={[
          {
            icon: 'arrow-left',
            iconType: 'feather',
            onPress: () => navigation.goBack()
          }
        ]}
        rightActions={[
          {
            icon: loading ? 'loader' : (isEditing ? 'x' : 'edit-2'),
            iconType: 'feather',
            onPress: loading ? undefined : (isEditing ? handleCancel : () => setIsEditing(true)),
            disabled: loading || saving
          },
          ...(isEditing ? [{
            icon: saving ? 'loader' : 'check',
            iconType: 'feather',
            onPress: saving ? undefined : handleSave,
            disabled: saving || loading
          }] : [])
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Feather name="loader" size={24} color="#01B97F" />
            <Text style={styles.loadingText}>Loading profile data...</Text>
          </View>
        ) : (
          <>
            {/* Personal Information Section */}
            <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderField('Full Name', formData.name, 'name')}
            {renderField('Email Address', formData.email, 'email')}
            {renderField('Phone Number', formData.phone, 'phone')}
            {renderField('Address', formData.address, 'address', true, true)}
          </View>
        </View>

        {/* Work Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Work Information</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderField('Employee ID', formData.employeeId, 'employeeId', false)}
            {renderField('Department', formData.department, 'department', false)}
            {renderField('Position', formData.position, 'position', false)}
          </View>
        </View>

        {/* Emergency Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="phone-call" size={20} color="#01B97F" />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>
          <View style={styles.sectionContent}>
            {renderField('Contact Name', formData.emergencyContact, 'emergencyContact')}
            {renderField('Contact Phone', formData.emergencyPhone, 'emergencyPhone')}
          </View>
        </View>

            <View style={styles.bottomSpacing} />
          </>
        )}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  sectionContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  fieldValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#01B97F',
  },
  fieldInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  bottomSpacing: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 12,
  },
});
