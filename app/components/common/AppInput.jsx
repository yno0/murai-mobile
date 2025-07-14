import React from "react";
import { TextInput } from "react-native";
import { COLORS, FONT, SPACING } from "../../constants/theme";

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style = {},
  ...props
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.TEXT_SECONDARY}
      secureTextEntry={secureTextEntry}
      style={[
        {
          backgroundColor: COLORS.INPUT_BG,
          borderRadius: SPACING.sm,
          padding: SPACING.md,
          color: COLORS.TEXT_MAIN,
          fontSize: FONT.regular,
        },
        style,
      ]}
      {...props}
    />
  );
} 