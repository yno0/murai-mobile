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

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 400;

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
      <View style={[styles.overlay, isSmallScreen && styles.mobileOverlay]}>
        <View style={[styles.modalContainer, isSmallScreen && styles.mobileModalContainer]}>
          {/* Mobile Handle Bar */}
          {isSmallScreen && (
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>
          )}

          {/* Header */}
          <View style={[styles.header, isSmallScreen && styles.mobileHeader]}>
            <View style={styles.headerLeft}>
              <View style={[
                styles.typeIconContainer,
                { backgroundColor: getTypeBackground(notification.type) },
                isSmallScreen && styles.mobileTypeIconContainer
              ]}>
                <MaterialCommunityIcons
                  name={getTypeIcon(notification.type)}
                  size={isSmallScreen ? 20 : 24}
                  color={getTypeColor(notification.type)}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, isSmallScreen && styles.mobileHeaderTitle]}>
                  Notification Details
                </Text>
                <Text style={[styles.headerSubtitle, isSmallScreen && styles.mobileHeaderSubtitle]}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={isSmallScreen ? 20 : 24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={[styles.content, isSmallScreen && styles.mobileContent]} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={[styles.statusContainer, isSmallScreen && styles.mobileStatusContainer]}>
              <View style={[styles.statusBadge, {
                backgroundColor: notification.isRead ? '#f3f4f6' : 'rgba(2, 185, 127, 0.1)',
                borderColor: notification.isRead ? '#d1d5db' : 'rgba(2, 185, 127, 0.3)'
              }, isSmallScreen && styles.mobileStatusBadge]}>
                <MaterialCommunityIcons
                  name={notification.isRead ? 'email-open' : 'email'}
                  size={isSmallScreen ? 14 : 16}
                  color={notification.isRead ? '#6b7280' : '#02B97F'}
                />
                <Text style={[styles.statusText, {
                  color: notification.isRead ? '#6b7280' : '#02B97F'
                }, isSmallScreen && styles.mobileStatusText]}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <View style={[styles.titleContainer, isSmallScreen && styles.mobileTitleContainer]}>
              <Text style={[styles.title, isSmallScreen && styles.mobileTitle]}>{notification.title}</Text>
            </View>

            {/* Message */}
            <View style={[styles.messageContainer, isSmallScreen && styles.mobileMessageContainer]}>
              <Text style={[styles.messageLabel, isSmallScreen && styles.mobileMessageLabel]}>Message</Text>
              <Text style={[styles.message, isSmallScreen && styles.mobileMessage]}>{notification.message}</Text>
            </View>

            {/* Timestamp */}
            <View style={[styles.timestampContainer, isSmallScreen && styles.mobileTimestampContainer]}>
              <Text style={[styles.timestampLabel, isSmallScreen && styles.mobileTimestampLabel]}>Received</Text>
              <Text style={[styles.timestamp, isSmallScreen && styles.mobileTimestamp]}>{formatDetailedTime(notification.createdAt)}</Text>
            </View>

            {/* Additional Info */}
            <View style={[styles.infoContainer, isSmallScreen && styles.mobileInfoContainer]}>
              <View style={[styles.infoRow, isSmallScreen && styles.mobileInfoRow]}>
                <Text style={[styles.infoLabel, isSmallScreen && styles.mobileInfoLabel]}>Type:</Text>
                <Text style={[styles.infoValue, { color: getTypeColor(notification.type) }, isSmallScreen && styles.mobileInfoValue]}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </Text>
              </View>
              <View style={[styles.infoRow, isSmallScreen && styles.mobileInfoRow]}>
                <Text style={[styles.infoLabel, isSmallScreen && styles.mobileInfoLabel]}>Priority:</Text>
                <Text style={[styles.infoValue, isSmallScreen && styles.mobileInfoValue]}>
                  {notification.type === 'alert' ? 'High' :
                   notification.type === 'warning' ? 'Medium' : 'Normal'}
                </Text>
              </View>
              {notification.isGlobal && (
                <View style={[styles.infoRow, isSmallScreen && styles.mobileInfoRow]}>
                  <Text style={[styles.infoLabel, isSmallScreen && styles.mobileInfoLabel]}>Scope:</Text>
                  <Text style={[styles.infoValue, isSmallScreen && styles.mobileInfoValue]}>Global Notification</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, isSmallScreen && styles.mobileActions]}>
            {!notification.isRead && (
              <TouchableOpacity
                style={[styles.markReadButton, isSmallScreen && styles.mobileMarkReadButton]}
                onPress={handleMarkAsRead}
              >
                <MaterialCommunityIcons name="email-open" size={isSmallScreen ? 18 : 20} color="#ffffff" />
                <Text style={[styles.markReadText, isSmallScreen && styles.mobileMarkReadText]}>Mark as Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.closeActionButton, isSmallScreen && styles.mobileCloseActionButton]} onPress={onClose}>
              <Text style={[styles.closeActionText, isSmallScreen && styles.mobileCloseActionText]}>Close</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  mobileOverlay: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '95%',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  mobileModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: '100%',
    maxHeight: '85%',
    minHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginHorizontal: 0,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  mobileHeader: {
    padding: 16,
    paddingTop: 12,
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
  mobileTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  mobileHeaderTitle: {
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  mobileHeaderSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
    minHeight: 250,
  },
  mobileContent: {
    padding: 16,
    paddingBottom: 0,
  },
  statusContainer: {
    marginBottom: 20,
  },
  mobileStatusContainer: {
    marginBottom: 16,
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
  mobileStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mobileStatusText: {
    fontSize: 14,
    marginLeft: 6,
  },
  titleContainer: {
    marginBottom: 20,
  },
  mobileTitleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 30,
  },
  mobileTitle: {
    fontSize: 19,
    lineHeight: 26,
  },
  messageContainer: {
    marginBottom: 20,
  },
  mobileMessageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  mobileMessageLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 26,
  },
  mobileMessage: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestampContainer: {
    marginBottom: 20,
  },
  mobileTimestampContainer: {
    marginBottom: 16,
  },
  timestampLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  mobileTimestampLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 17,
    color: '#6b7280',
  },
  mobileTimestamp: {
    fontSize: 15,
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  mobileInfoContainer: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileInfoRow: {
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  mobileInfoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mobileInfoValue: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  mobileActions: {
    padding: 16,
    paddingTop: 12,
    gap: 10,
  },
  markReadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#02B97F',
    paddingVertical: 16,
    borderRadius: 12,
  },
  mobileMarkReadButton: {
    paddingVertical: 14,
    borderRadius: 10,
  },
  markReadText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  mobileMarkReadText: {
    fontSize: 16,
    marginLeft: 6,
  },
  closeActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  mobileCloseActionButton: {
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeActionText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  mobileCloseActionText: {
    fontSize: 16,
  },
});

export default NotificationDetailModal;
