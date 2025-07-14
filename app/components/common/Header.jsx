import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function Header({
  title,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  style = {},
  titleStyle = {},
}) {
  return (
    <SafeAreaView style={{ backgroundColor: COLORS.BG }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "ios" ? 12 : 20,
          paddingBottom: 16,
          backgroundColor: COLORS.BG,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.CARD_BG,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 1,
          ...style,
        }}
      >
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={{ padding: 8, marginRight: 8 }}>
            <Feather name="arrow-left" size={24} color={COLORS.ACCENT} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
        <Text
          style={{
            color: COLORS.TEXT_MAIN,
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            ...titleStyle,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={{ padding: 8, marginLeft: 8 }}>
            <Feather name={rightIcon} size={22} color={COLORS.ACCENT} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32, height: 32 }} />
        )}
      </View>
    </SafeAreaView>
  );
} 