import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

const MainHeader = require('../../../components/common/MainHeader').default;

export default function PersonalDetailsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    // Initialize form data with user information
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: 'Administration',
      position: 'System Administrator',
      employeeId: user?.employeeId || 'ADM001',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || '',
    });
  }, [user]);

  const handleSave = () => {
    // TODO: Implement API call to save personal details
    Alert.alert('Success', 'Personal details updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: 'Administration',
      position: 'System Administrator',
      employeeId: user?.employeeId || 'ADM001',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || '',
    });
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
            icon: isEditing ? 'x' : 'edit-2',
            iconType: 'feather',
            onPress: isEditing ? handleCancel : () => setIsEditing(true)
          },
          ...(isEditing ? [{
            icon: 'check',
            iconType: 'feather',
            onPress: handleSave
          }] : [])
        ]}
        style={{ paddingHorizontal: 0 }}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
});
