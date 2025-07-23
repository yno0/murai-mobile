import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function AdminProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AsyncStorage.multiRemove(['user', 'token', 'refreshToken']);
      if (logout) logout();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'There was an issue logging out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const profileOptions = [
    {
      id: 'personal',
      title: 'Personal Details',
      icon: 'user',
      onPress: () => navigation.navigate('PersonalDetails')
    },
    {
      id: 'system',
      title: 'System Logs',
      icon: 'file-text',
      onPress: () => navigation.navigate('SystemLogs')
    },
    {
      id: 'settings',
      title: 'Account Settings',
      icon: 'settings',
      onPress: () => navigation.navigate('AccountSettings')
    }
  ];



  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>My Profile</Text>

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

          <Text style={styles.profileName}>{user?.name || 'Admin User'}</Text>

          <View style={styles.roleContainer}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>System Administrator</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.roleText}>MURAi Admin</Text>
          </View>

          <View style={styles.managerSection}>
            <View style={styles.managerItem}>
              <Text style={styles.managerLabel}>System Manager</Text>
              <Text style={styles.managerName}>MURAi System</Text>
            </View>
            <View style={styles.managerItem}>
              <Text style={styles.managerLabel}>Department</Text>
              <View style={styles.departmentContainer}>
                <Text style={styles.departmentText}>Administration</Text>
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
              style={styles.menuItem}
              onPress={option.onPress}
            >
              <View style={styles.menuLeft}>
                <Feather name={option.icon} size={20} color="#A8AAB0" />
                <Text style={styles.menuText}>{option.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#A8AAB0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
        >
          <Feather
            name={isLoggingOut ? "loader" : "log-out"}
            size={20}
            color={isLoggingOut ? "#9CA3AF" : "#01B97F"}
          />
          <Text style={[styles.logoutText, isLoggingOut && styles.logoutTextDisabled]}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center' }}>
              <Feather name="log-out" size={32} color="#EF4444" style={{ marginBottom: 12 }} />
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, color: '#1D1D1F', marginBottom: 8, textAlign: 'center' }}>
                Confirm Logout
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 15, color: '#6C6C6C', marginBottom: 24, textAlign: 'center' }}>
                Are you sure you want to logout? You will be redirected to the login screen.
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 8, alignItems: 'center' }}
                  onPress={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                >
                  <Text style={{ color: '#6C6C6C', fontFamily: 'Poppins-Medium', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#EF4444', marginLeft: 8, alignItems: 'center' }}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 16 }}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom spacing */}
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 24,
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