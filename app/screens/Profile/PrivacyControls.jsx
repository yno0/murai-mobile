import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyControls() {
  const navigation = useNavigation();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    shareLocation: false,
    dataCollection: true,
    analyticsTracking: false,
    thirdPartySharing: false,
    publicProfile: false,
  });

  const toggleSetting = (key) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const privacySections = [
    {
      title: "Profile Privacy",
      description: "Control who can see your profile and information",
      options: [
        {
          key: "profileVisibility",
          title: "Profile Visibility",
          subtitle: "Make your profile visible to other users",
          icon: "eye",
          color: "#3b82f6",
        },
        {
          key: "publicProfile",
          title: "Public Profile",
          subtitle: "Make your profile searchable publicly",
          icon: "globe",
          color: "#8b5cf6",
        },
      ]
    },
    {
      title: "Location & Sharing",
      description: "Manage location data and sharing preferences",
      options: [
        {
          key: "shareLocation",
          title: "Share Location",
          subtitle: "Allow location sharing for features",
          icon: "map-pin",
          color: "#ef4444",
        },
        {
          key: "thirdPartySharing",
          title: "Third-party Sharing",
          subtitle: "Share data with partner services",
          icon: "share-2",
          color: "#f59e0b",
        },
      ]
    },
    {
      title: "Data & Analytics",
      description: "Control how your data is collected and used",
      options: [
        {
          key: "dataCollection",
          title: "Data Collection",
          subtitle: "Allow app to collect usage data",
          icon: "database",
          color: "#10b981",
        },
        {
          key: "analyticsTracking",
          title: "Analytics Tracking",
          subtitle: "Help us improve with anonymous analytics",
          icon: "trending-up",
          color: "#f97316",
        },
      ]
    }
  ];

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
              Privacy Controls
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Manage your privacy and data settings
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Privacy Notice */}
        <View style={{
          backgroundColor: '#1e3a8a30',
          borderWidth: 1,
          borderColor: '#3b82f630',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: '#3b82f620',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              marginTop: 4,
            }}>
              <Feather name="shield" size={24} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#93c5fd', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                Your Privacy Matters
              </Text>
              <Text style={{ color: '#bfdbfe', fontSize: 14, lineHeight: 22 }}>
                We're committed to protecting your privacy. These settings give you control over how your data is used and shared. Changes take effect immediately.
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Sections */}
        {privacySections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{
            backgroundColor: '#111827',
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#1f2937',
          }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                {section.title}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                {section.description}
              </Text>
            </View>
            
            <View style={{ gap: 16 }}>
              {section.options.map((option) => (
                <View
                  key={option.key}
                  style={{
                    backgroundColor: '#1f2937',
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#374151',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${option.color}20`,
                        marginRight: 16,
                      }}>
                        <Feather name={option.icon} size={22} color={option.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                          {option.title}
                        </Text>
                        <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                          {option.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={privacySettings[option.key]}
                      onValueChange={() => toggleSetting(option.key)}
                      trackColor={{ false: "#374151", true: "#10b981" }}
                      thumbColor={privacySettings[option.key] ? "#fff" : "#9ca3af"}
                      ios_backgroundColor="#374151"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Data Management Actions */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Data Management
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
            Access and manage your personal data
          </Text>
          
          <View style={{ gap: 16 }}>
            <TouchableOpacity style={{
              backgroundColor: '#1f2937',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#374151',
            }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#10b98120',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Feather name="download" size={22} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                  Download My Data
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                  Get a copy of all your data
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={{
              backgroundColor: '#7f1d1d30',
              borderWidth: 1,
              borderColor: '#ef444430',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: '#ef444420',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Feather name="trash-2" size={22} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fca5a5', fontSize: 18, fontWeight: '600' }}>
                  Delete All Data
                </Text>
                <Text style={{ color: '#fecaca', fontSize: 14 }}>
                  Permanently remove all your data
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
