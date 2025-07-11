import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SecuritySettings() {
  const navigation = useNavigation();
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    autoLock: true,
    sessionTimeout: true,
    loginAlerts: true,
    deviceTracking: false,
  });

  const toggleSetting = (key) => {
    setSecuritySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const securitySections = [
    {
      title: "Authentication",
      description: "Secure your account with multiple layers of protection",
      options: [
        {
          key: "twoFactorAuth",
          title: "Two-Factor Authentication",
          subtitle: "Add an extra layer of security",
          icon: "shield",
          color: "#ef4444",
          recommended: true,
        },
        {
          key: "biometricLogin",
          title: "Biometric Login",
          subtitle: "Use fingerprint or face ID to login",
          icon: "fingerprint",
          color: "#3b82f6",
        },
      ]
    },
    {
      title: "Session Management",
      description: "Control how your sessions are managed",
      options: [
        {
          key: "autoLock",
          title: "Auto Lock",
          subtitle: "Automatically lock the app when idle",
          icon: "lock",
          color: "#f59e0b",
        },
        {
          key: "sessionTimeout",
          title: "Session Timeout",
          subtitle: "Auto logout after inactivity",
          icon: "clock",
          color: "#8b5cf6",
        },
      ]
    },
    {
      title: "Monitoring",
      description: "Stay informed about your account activity",
      options: [
        {
          key: "loginAlerts",
          title: "Login Alerts",
          subtitle: "Get notified of new login attempts",
          icon: "alert-circle",
          color: "#10b981",
        },
        {
          key: "deviceTracking",
          title: "Device Tracking",
          subtitle: "Track devices that access your account",
          icon: "smartphone",
          color: "#f97316",
        },
      ]
    }
  ];

  const actionItems = [
    {
      title: "Change Password",
      subtitle: "Update your account password",
      icon: "key",
      color: "#3b82f6",
      onPress: () => {},
    },
    {
      title: "Active Sessions",
      subtitle: "Manage your active login sessions",
      icon: "monitor",
      color: "#8b5cf6",
      onPress: () => {},
    },
    {
      title: "Trusted Devices",
      subtitle: "Manage your trusted devices",
      icon: "check-circle",
      color: "#10b981",
      onPress: () => {},
    },
    {
      title: "Security Log",
      subtitle: "View your security activity",
      icon: "file-text",
      color: "#f59e0b",
      onPress: () => {},
    },
  ];

  // Calculate security score
  const enabledCount = Object.values(securitySettings).filter(Boolean).length;
  const totalCount = Object.keys(securitySettings).length;
  const securityScore = Math.round((enabledCount / totalCount) * 100);

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
              Security Settings
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 14, marginTop: 4 }}>
              Protect your account and data
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
        {/* Security Score */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                Security Score
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                Your account security strength
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: securityScore >= 70 ? '#10b98120' : securityScore >= 50 ? '#f59e0b20' : '#ef444420',
              }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: securityScore >= 70 ? '#34d399' : securityScore >= 50 ? '#fbbf24' : '#fca5a5',
                }}>
                  {securityScore}
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
                color: securityScore >= 70 ? '#34d399' : securityScore >= 50 ? '#fbbf24' : '#fca5a5',
              }}>
                {securityScore >= 70 ? 'Strong' : securityScore >= 50 ? 'Fair' : 'Weak'}
              </Text>
            </View>
          </View>
          
          <View style={{
            backgroundColor: '#1f2937',
            borderRadius: 12,
            padding: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Feather 
                name={securityScore >= 70 ? "shield-check" : "shield"} 
                size={20} 
                color={securityScore >= 70 ? "#10b981" : "#f59e0b"} 
              />
              <Text style={{
                fontWeight: '600',
                marginLeft: 8,
                color: securityScore >= 70 ? '#34d399' : '#fbbf24',
              }}>
                {securityScore >= 70 ? 'Your account is well protected' : 'Consider enabling more security features'}
              </Text>
            </View>
            <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
              {enabledCount} of {totalCount} security features are enabled
            </Text>
          </View>
        </View>

        {/* Security Sections */}
        {securitySections.map((section, sectionIndex) => (
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
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
                            {option.title}
                          </Text>
                          {option.recommended && (
                            <View style={{
                              backgroundColor: '#10b981',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 12,
                              marginLeft: 8,
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                                Recommended
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20, marginTop: 4 }}>
                          {option.subtitle}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={securitySettings[option.key]}
                      onValueChange={() => toggleSetting(option.key)}
                      trackColor={{ false: "#374151", true: "#10b981" }}
                      thumbColor={securitySettings[option.key] ? "#fff" : "#9ca3af"}
                      ios_backgroundColor="#374151"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Security Actions */}
        <View style={{
          backgroundColor: '#111827',
          borderRadius: 24,
          padding: 24,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: '#1f2937',
        }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Security Actions
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
            Manage passwords, sessions, and security logs
          </Text>
          
          <View style={{ gap: 16 }}>
            {actionItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  backgroundColor: '#1f2937',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#374151',
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${item.color}20`,
                  marginRight: 16,
                }}>
                  <Feather name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 14, lineHeight: 20 }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
