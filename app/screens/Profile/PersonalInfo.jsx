import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from "../../context/AuthContext";

export default function PersonalInfo() {
  const navigation = useNavigation();
  const { user, loading, logout } = useAuth();

  const profileOptions = [
    {
      title: "Account Management",
      icon: "account-cog",
      onPress: () => navigation.navigate("AccountManagement"),
    },
    {
      title: "Notification Preferences",
      icon: "bell-outline",
      onPress: () => navigation.navigate("NotificationPreferences"),
    },
    {
      title: "Privacy Controls",
      icon: "shield-outline",
      onPress: () => navigation.navigate("PrivacyControls"),
    },
    {
      title: "Security Settings",
      icon: "lock-outline",
      onPress: () => navigation.navigate("SecuritySettings"),
    },
    {
      title: "Accessibility Settings",
      icon: "eye-outline",
      onPress: () => navigation.navigate("AccessibilitySettings"),
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <MaterialCommunityIcons 
                name={option.icon} 
                size={20} 
                color="#02B97F" 
              />
              <Text style={styles.optionText}>{option.title}</Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color="#02B97F" 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  profileCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#374151',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
