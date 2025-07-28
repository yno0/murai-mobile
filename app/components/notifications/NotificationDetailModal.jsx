import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const NotificationDetailModal = ({ visible, notification, onClose, onMarkAsRead }) => {
  if (!notification) return null;

  const formatDetailedTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return 'alert-circle';
      case 'warning': return 'alert';
      case 'success': return 'check-circle';
      case 'info': return 'information';
      default: return 'bell';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#02B97F';
      case 'info': return '#02B97F';
      default: return '#02B97F';
    }
  };

  const getTypeBackground = (type) => {
    switch (type) {
      case 'alert': return '#fef2f2';
      case 'warning': return '#fffbeb';
      case 'success': return 'rgba(2, 185, 127, 0.1)';
      case 'info': return 'rgba(2, 185, 127, 0.1)';
      default: return 'rgba(2, 185, 127, 0.1)';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.typeIconContainer, { backgroundColor: getTypeBackground(notification.type) }]}>
                <MaterialCommunityIcons
                  name={getTypeIcon(notification.type)}
                  size={24}
                  color={getTypeColor(notification.type)}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Notification Details</Text>
                <Text style={styles.headerSubtitle}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, {
                backgroundColor: notification.isRead ? '#f3f4f6' : 'rgba(2, 185, 127, 0.1)',
                borderColor: notification.isRead ? '#d1d5db' : 'rgba(2, 185, 127, 0.3)'
              }]}>
                <MaterialCommunityIcons
                  name={notification.isRead ? 'email-open' : 'email'}
                  size={16}
                  color={notification.isRead ? '#6b7280' : '#02B97F'}
                />
                <Text style={[styles.statusText, {
                  color: notification.isRead ? '#6b7280' : '#02B97F'
                }]}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{notification.title}</Text>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message</Text>
              <Text style={styles.message}>{notification.message}</Text>
            </View>

            {/* Timestamp */}
            <View style={styles.timestampContainer}>
              <Text style={styles.timestampLabel}>Received</Text>
              <Text style={styles.timestamp}>{formatDetailedTime(notification.createdAt)}</Text>
            </View>

            {/* Additional Info */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={[styles.infoValue, { color: getTypeColor(notification.type) }]}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Priority:</Text>
                <Text style={styles.infoValue}>
                  {notification.type === 'alert' ? 'High' : 
                   notification.type === 'warning' ? 'Medium' : 'Normal'}
                </Text>
              </View>
              {notification.isGlobal && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Scope:</Text>
                  <Text style={styles.infoValue}>Global Notification</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {!notification.isRead && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={handleMarkAsRead}
              >
                <MaterialCommunityIcons name="email-open" size={20} color="#ffffff" />
                <Text style={styles.markReadText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeActionButton} onPress={onClose}>
              <Text style={styles.closeActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: width - 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 28,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  timestampContainer: {
    marginBottom: 20,
  },
  timestampLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  markReadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02B97F',
    paddingVertical: 12,
    borderRadius: 8,
  },
  markReadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeActionText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationDetailModal;
