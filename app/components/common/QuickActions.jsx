import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function QuickActions({ actions = [], onActionPress }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ 
        color: COLORS.TEXT_MAIN, 
        fontSize: 16, 
        fontFamily: "Poppins-Bold", 
        marginBottom: 16 
      }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onActionPress?.(action)}
            style={{
              backgroundColor: COLORS.PRIMARY,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              minWidth: 80,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 14, 
              fontFamily: "Poppins-Medium" 
            }}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
} 