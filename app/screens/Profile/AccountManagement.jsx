import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import AppInput from "../../components/common/AppInput";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";


export default function AccountManagement() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Parse the full name into first and last name
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Combine first and last name
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      
      // Mock profile update
      console.log('Mock profile update:', { fullName, email: formData.email });
      Alert.alert("Success", "Profile updated successfully! (Mock implementation)");
      
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
        <Text style={{ color: 'white', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  const BG = COLORS.BG;
  const CARD_BG = COLORS.CARD_BG;
  const ACCENT = COLORS.ACCENT;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const TEXT_SECONDARY = COLORS.TEXT_SECONDARY;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <Header title="Account Management" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}>
          <AppInput
            value={formData.firstName}
            onChangeText={value => handleInputChange('firstName', value)}
            placeholder="First Name"
            style={{ marginBottom: 16 }}
          />
          <AppInput
            value={formData.lastName}
            onChangeText={value => handleInputChange('lastName', value)}
            placeholder="Last Name"
            style={{ marginBottom: 16 }}
          />
          <AppInput
            value={formData.email}
            onChangeText={value => handleInputChange('email', value)}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />
          <AppInput
            value={formData.phone}
            onChangeText={value => handleInputChange('phone', value)}
            placeholder="Phone"
            keyboardType="phone-pad"
            style={{ marginBottom: 16 }}
          />
          <AppButton
            title={saving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 32 }}>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#22c55e' : '#34d399',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 12,
              opacity: saving ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ 
              color: '#0f0f0f', 
              fontSize: 16, 
              fontWeight: '600', 
              textAlign: 'center',
            }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleCancel}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: '#1a1a1a',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ 
              color: '#9ca3af', 
              fontSize: 16, 
              textAlign: 'center',
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          padding: 20,
          marginBottom: 40,
        }}>
          <Text style={{ 
            color: '#ef4444', 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 8,
          }}>
            Delete Account
          </Text>
          <Text style={{ 
            color: '#9ca3af', 
            fontSize: 14, 
            marginBottom: 16, 
            lineHeight: 20,
          }}>
            Once you delete your account, there is no going back.
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#ef4444',
              paddingVertical: 12,
              borderRadius: 8,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 14, 
              fontWeight: '600', 
              textAlign: 'center',
            }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
