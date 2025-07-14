import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

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

  const privacyOptions = [
    { key: "profileVisibility", title: "Profile Visibility" },
    { key: "shareLocation", title: "Share Location" },
    { key: "dataCollection", title: "Data Collection" },
    { key: "analyticsTracking", title: "Analytics Tracking" },
    { key: "thirdPartySharing", title: "Third-party Sharing" },
    { key: "publicProfile", title: "Public Profile" },
  ];

  const BG = COLORS.BG;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const ACCENT = COLORS.ACCENT;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Header title="Privacy Controls" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {privacyOptions.map((option, index) => (
            <View
              key={option.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderBottomWidth: index < privacyOptions.length - 1 ? 1 : 0,
                borderBottomColor: '#262626',
              }}
            >
              <Text style={{ 
                color: TEXT_MAIN, 
                fontSize: 16, 
                flex: 1,
              }}>
                {option.title}
              </Text>
              <Switch
                value={privacySettings[option.key]}
                onValueChange={() => toggleSetting(option.key)}
                trackColor={{ false: "#404040", true: ACCENT }}
                thumbColor="#fff"
                ios_backgroundColor="#404040"
              />
            </View>
          ))}
        </View>

        {/* Data Actions */}
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 40,
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#262626',
            }}
            activeOpacity={0.7}
          >
            <Feather name="download" size={20} color="#9ca3af" style={{ marginRight: 16 }} />
            <Text style={{ 
              color: TEXT_MAIN, 
              fontSize: 16, 
              flex: 1,
            }}>
              Download My Data
            </Text>
            <Feather name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={20} color="#ef4444" style={{ marginRight: 16 }} />
            <Text style={{ 
              color: '#ef4444', 
              fontSize: 16, 
              flex: 1,
            }}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
