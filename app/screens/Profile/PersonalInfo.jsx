import { Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAccessibility } from "../../context/AccessibilityContext";
import { useAuth } from "../../context/AuthContext";

// Helper function to get current time
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function PersonalInfo() {
  const navigation = useNavigation();
  const { user, loading, logout } = useAuth();
  const { getAccessibleTextStyle, getAccessibleTouchableStyle } = useAccessibility();

  const profileOptions = [
    {
      id: 'account',
      title: "Account Management",
      icon: "settings",
      onPress: () => navigation.navigate("AccountManagement"),
    },
    {
      id: 'notifications',
      title: "Notification Preferences",
      icon: "bell",
      onPress: () => navigation.navigate("NotificationPreferences"),
    },
    {
      id: 'privacy',
      title: "Privacy Controls",
      icon: "shield",
      onPress: () => navigation.navigate("PrivacyControls"),
    },
    {
      id: 'security',
      title: "Security Settings",
      icon: "lock",
      onPress: () => navigation.navigate("SecuritySettings"),
    },
    {
      id: 'accessibility',
      title: "Accessibility Settings",
      icon: "eye",
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Feather name="user" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Text style={styles.editImageText}>Edit Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <Feather name="clock" size={12} color="#A8AAB0" />
            <Text style={styles.timeText}>{getCurrentTime()}, Philippine Time</Text>
          </View>

          <Text style={styles.profileName}>
            {loading ? 'Loading...' : (user?.name || 'User')}
          </Text>

          <View style={styles.roleContainer}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>Mobile User</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.roleText}>MURAi App</Text>
          </View>

          <View style={styles.managerSection}>
            <View style={styles.managerItem}>
              <Text style={getAccessibleTextStyle(styles.managerLabel)}>Email</Text>
              <Text style={getAccessibleTextStyle(styles.managerName)}>
                {loading ? 'Loading...' : (user?.email || 'user@example.com')}
              </Text>
            </View>
            <View style={styles.managerItem}>
              <Text style={getAccessibleTextStyle(styles.managerLabel)}>Status</Text>
              <View style={styles.departmentContainer}>
                <Text style={getAccessibleTextStyle(styles.departmentText)}>Active</Text>
                <Feather name="chevron-right" size={16} color="#A8AAB0" />
              </View>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={getAccessibleTouchableStyle(styles.menuItem)}
              onPress={option.onPress}
              accessibilityLabel={option.title}
              accessibilityRole="button"
            >
              <View style={styles.menuLeft}>
                <Feather name={option.icon} size={20} color="#A8AAB0" />
                <Text style={getAccessibleTextStyle(styles.menuText)}>{option.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#A8AAB0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={getAccessibleTouchableStyle([styles.logoutButton, loading && styles.logoutButtonDisabled])}
          onPress={logout}
          disabled={loading}
          accessibilityLabel={loading ? 'Logging out...' : 'Logout'}
          accessibilityState={{ disabled: loading }}
        >
          <Feather name="log-out" size={16} color={loading ? '#9CA3AF' : '#01B97F'} />
          <Text style={getAccessibleTextStyle([styles.logoutText, loading && styles.logoutTextDisabled])}>
            {loading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#A8AAB0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#01B97F',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  editImageButton: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editImageText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6C6C6C',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#A8AAB0',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#01B97F',
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C',
  },
  separator: {
    fontSize: 14,
    color: '#A8AAB0',
  },
  managerSection: {
    gap: 16,
  },
  managerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  managerLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6C6C6C',
  },
  managerName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  departmentText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e5e7eb',
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#01B97F',
  },
  logoutTextDisabled: {
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 40,
  },
});
