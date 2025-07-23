import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ACCESSIBILITY, COLORS } from "../../constants/theme";

const mockNotifications = [
  { id: 1, title: "Welcome!", message: "Thanks for joining Murai. Explore your dashboard!", time: "Just now" },
  { id: 2, title: "Group Invite", message: "You have been invited to join the group 'React Devs'.", time: "2h ago" },
  { id: 3, title: "Protection Active", message: "Your extension protection is now active.", time: "Today" },
];

export default function NotificationModal({ visible, onClose }) {
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      accessibilityLabel="Notifications modal"
      accessibilityRole="dialog"
    >
      <View 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        accessibilityRole="button"
        accessibilityLabel="Close modal background"
        onTouchEnd={onClose}
      >
        <View 
          style={{
            backgroundColor: COLORS.CARD_BG,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 32,
            width: '100%',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12
          }}
          accessibilityRole="dialog"
          accessibilityLabel="Notifications list"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
            <Feather name="bell" size={22} color={COLORS.ACCENT} style={{ marginRight: 8 }} />
            <Text 
              style={{ 
                fontFamily: "Poppins-Bold", 
                fontSize: 18, 
                color: COLORS.TEXT_MAIN, 
                flex: 1 
              }}
              accessibilityRole="header"
            >
              Notifications
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ 
                padding: 6, 
                borderRadius: 8,
                minWidth: ACCESSIBILITY.minTouchTarget,
                minHeight: ACCESSIBILITY.minTouchTarget,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              accessibilityHint="Double tap to close the notifications modal"
            >
              <Feather name="x" size={22} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={{ maxHeight: 320 }} 
            showsVerticalScrollIndicator={false}
            accessibilityRole="scroll"
            accessibilityLabel="Notifications list"
          >
            {mockNotifications.length === 0 ? (
              <Text 
                style={{ color: COLORS.TEXT_SECONDARY, fontSize: 15, textAlign: 'center', marginTop: 40 }}
                accessibilityRole="text"
              >
                No notifications yet.
              </Text>
            ) : (
              mockNotifications.map(n => (
                <View 
                  key={n.id} 
                  style={{
                    backgroundColor: COLORS.BG,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.10)',
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${n.title}: ${n.message}`}
                  accessibilityHint={`Notification from ${n.time}`}
                >
                  <Text 
                    style={{ 
                      color: COLORS.TEXT_MAIN, 
                      fontFamily: "Poppins-Bold", 
                      fontSize: 15, 
                      marginBottom: 4 
                    }}
                    accessibilityRole="text"
                  >
                    {n.title}
                  </Text>
                  <Text 
                    style={{ color: COLORS.TEXT_SECONDARY, fontSize: 14, marginBottom: 6 }}
                    accessibilityRole="text"
                  >
                    {n.message}
                  </Text>
                  <Text 
                    style={{ color: COLORS.ACCENT, fontSize: 12, textAlign: 'right' }}
                    accessibilityRole="text"
                  >
                    {n.time}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
} 