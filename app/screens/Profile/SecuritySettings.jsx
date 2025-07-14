import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, View } from "react-native";
import AppButton from "../../components/common/AppButton";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

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

  const BG = COLORS.BG;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const ACCENT = COLORS.ACCENT;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <Header title="Security Settings" showBack onBack={() => navigation.goBack()} />

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
          {actionItems.map((item, idx) => (
            <AppButton
              key={item.title}
              title={item.title}
              onPress={() => {}}
              style={{ marginBottom: 12 }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
