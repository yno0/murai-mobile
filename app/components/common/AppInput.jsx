import { TextInput } from "react-native";
import { COLORS, globalStyles } from "../../constants/theme";

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  style = {},
  accessibilityLabel,
  accessibilityHint,
  ...props
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.TEXT_MUTED}
      secureTextEntry={secureTextEntry}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || placeholder}
      accessibilityHint={accessibilityHint || `Enter your ${placeholder?.toLowerCase() || 'text'}`}
      accessibilityState={{ disabled: props.editable === false }}
      style={[
        globalStyles.input,
        style,
      ]}
      {...props}
    />
  );
} 