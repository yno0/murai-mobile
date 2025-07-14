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
  ...props
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: COLORS.ACCENT,
          borderRadius: SPACING.sm,
          padding: SPACING.md,
          alignItems: "center",
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.BG} />
      ) : (
        <Text style={[{ color: COLORS.BG, fontWeight: "bold", fontSize: FONT.regular }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 