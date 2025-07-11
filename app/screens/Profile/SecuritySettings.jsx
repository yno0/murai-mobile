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

  const securityOptions = [
    { key: "twoFactorAuth", title: "Two-Factor Authentication", recommended: true },
    { key: "biometricLogin", title: "Biometric Login" },
    { key: "autoLock", title: "Auto Lock" },
    { key: "sessionTimeout", title: "Session Timeout" },
    { key: "loginAlerts", title: "Login Alerts" },
    { key: "deviceTracking", title: "Device Tracking" },
  ];

  const actionItems = [
    { title: "Change Password", icon: "key" },
    { title: "Active Sessions", icon: "monitor" },
    { title: "Trusted Devices", icon: "check-circle" },
    { title: "Security Log", icon: "file-text" },
  ];

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
            Security Settings
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {/* Security Options */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {securityOptions.map((option, index) => (
            <View
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: index < securityOptions.length - 1 ? 1 : 0,
                borderBottomColor: '#262626',
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  flex: 1,
                }}>
                  {option.title}
                </Text>
                {option.recommended && (
                  <View style={{
                    backgroundColor: '#34d399',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginRight: 12,
                  }}>
                    <Text style={{ 
                      color: '#0f0f0f', 
                      fontSize: 10, 
                      fontWeight: '600',
                    }}>
                      RECOMMENDED
                    </Text>
                  </View>
                )}
              </View>
              <Switch
                value={securitySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: "#404040", true: "#34d399" }}
                thumbColor="#fff"
                ios_backgroundColor="#404040"
              />
            </View>
          ))}
        </View>

        {/* Security Actions */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 40,
        }}>
          {actionItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: index < actionItems.length - 1 ? 1 : 0,
                borderBottomColor: '#262626',
              }}
              activeOpacity={0.7}
            >
              <Feather name={item.icon} size={20} color="#9ca3af" style={{ marginRight: 16 }} />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                flex: 1,
              }}>
                {item.title}
              </Text>
              <Feather name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
