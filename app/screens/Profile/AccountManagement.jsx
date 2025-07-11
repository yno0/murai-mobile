import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AccountManagement() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />
      
      {/* Header */}
      <View style={{
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#1f2937',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Feather name="arrow-left" size={20} color="#34d399" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Account Management
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Update your personal information
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Profile Picture Section */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Profile Picture
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#10b981',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Feather name="user" size={32} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={{
                backgroundColor: '#10b981',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginBottom: 8,
              }}>
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                  Change Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                backgroundColor: '#1f2937',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}>
                <Text style={{ color: '#d1d5db', fontWeight: '600', textAlign: 'center' }}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>
            Personal Information
          </Text>
          
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
                First Name
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange("firstName", value)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                    fontSize: 16,
                    paddingRight: 48,
                  }}
                  placeholderTextColor="#6b7280"
                />
                <View style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}>
                  <Feather name="user" size={20} color="#6b7280" />
                </View>
              </View>
            </View>

            <View>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
                Last Name
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange("lastName", value)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                    fontSize: 16,
                    paddingRight: 48,
                  }}
                  placeholderTextColor="#6b7280"
                />
                <View style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}>
                  <Feather name="user" size={20} color="#6b7280" />
                </View>
              </View>
            </View>

            <View>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
                Email Address
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                    fontSize: 16,
                    paddingRight: 48,
                  }}
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                />
                <View style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}>
                  <Feather name="mail" size={20} color="#6b7280" />
                </View>
              </View>
            </View>

            <View>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
                Phone Number
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  style={{
                    backgroundColor: '#1f2937',
                    color: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                    fontSize: 16,
                    paddingRight: 48,
                  }}
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                />
                <View style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}>
                  <Feather name="phone" size={20} color="#6b7280" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 16, marginBottom: 32 }}>
          <LinearGradient
            colors={['#10b981', '#14b8a6']}
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 24,
            }}
          >
            <TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="check" size={20} color="#fff" />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                  Save Changes
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity style={{
            backgroundColor: '#1f2937',
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: '#374151',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={20} color="#6b7280" />
              <Text style={{ color: '#d1d5db', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={{
          backgroundColor: '#7f1d1d20',
          borderWidth: 1,
          borderColor: '#ef444430',
          borderRadius: 24,
          padding: 24,
        }}>
          <Text style={{ color: '#fca5a5', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Danger Zone
          </Text>
          <Text style={{ color: '#fecaca', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
            Once you delete your account, there is no going back. Please be certain.
          </Text>
          <TouchableOpacity style={{
            backgroundColor: '#dc2626',
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="trash-2" size={20} color="#fff" />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                Delete Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
