import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { appwriteService } from "../../services/appwrite";

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
      
      // Update name if it changed
      if (fullName !== user.name) {
        await appwriteService.updateName(fullName);
      }
      
      // Update email if it changed
      if (formData.email !== user.email) {
        Alert.alert(
          "Email Update",
          "To change your email, you'll need to confirm your current password.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Continue", 
              onPress: () => {
                Alert.prompt(
                  "Confirm Password",
                  "Enter your current password to update your email:",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Update", 
                      onPress: async (password) => {
                        if (password) {
                          try {
                            await appwriteService.updateEmail(formData.email, password);
                            Alert.alert("Success", "Email updated successfully!");
                          } catch (error) {
                            Alert.alert("Error", error.message || "Failed to update email");
                          }
                        }
                      }
                    }
                  ],
                  "secure-text"
                );
              }
            }
          ]
        );
      } else {
        Alert.alert("Success", "Profile updated successfully!");
      }
      
      // Note: Phone number is not stored in Appwrite user object by default
      // You would need to implement a separate user preferences collection for this
      
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

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginRight: 16 }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#34d399" />
          </TouchableOpacity>
          <Text style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: '600',
          }}>
            Account Management
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}>
          {[
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email Address', keyboardType: 'email-address' },
            { key: 'phone', label: 'Phone Number', keyboardType: 'phone-pad' },
          ].map((field, index) => (
            <View key={field.key} style={{ marginBottom: index < 3 ? 20 : 0 }}>
              <Text style={{ 
                color: '#9ca3af', 
                fontSize: 14, 
                marginBottom: 8,
              }}>
                {field.label}
              </Text>
              <TextInput
                value={formData[field.key]}
                onChangeText={(value) => handleInputChange(field.key, value)}
                style={{
                  backgroundColor: '#262626',
                  color: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
                placeholderTextColor="#6b7280"
                keyboardType={field.keyboardType}
              />
            </View>
          ))}
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
