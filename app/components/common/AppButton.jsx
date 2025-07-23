import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
  accessibilityLabel,
  accessibilityHint,
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Double tap to ${title.toLowerCase()}`}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        {
          backgroundColor: disabled || loading ? COLORS.GRAY_BTN : COLORS.PRIMARY,
          borderRadius: SPACING.sm,
          padding: SPACING.md,
          alignItems: "center",
          opacity: disabled || loading ? 0.6 : 1,
          borderWidth: 1,
          borderColor: disabled || loading ? COLORS.BORDER : 'transparent',
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.BG} accessibilityLabel="Loading indicator" />
      ) : (
        <Text 
          style={[{ 
            color: disabled || loading ? COLORS.TEXT_MUTED : '#FFFFFF', 
            fontFamily: "Poppins-SemiBold", 
            fontSize: FONT.regular 
          }, textStyle]}
          accessibilityRole="text"
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 