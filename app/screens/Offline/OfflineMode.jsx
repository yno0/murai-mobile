import React from "react";
import { Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

const OfflineMode = () => {
  const BG = COLORS.BG;
  const CARD_BG = COLORS.CARD_BG;
  const ACCENT = COLORS.ACCENT;
  const TEXT_MAIN = COLORS.TEXT_MAIN;
  const TEXT_SECONDARY = COLORS.TEXT_SECONDARY;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BG }}>
      <Text style={{ color: TEXT_MAIN, fontSize: 24, fontWeight: "bold" }}>Offline Mode</Text>
      <Text style={{ color: TEXT_SECONDARY, marginTop: 12, fontSize: 16 }}>
        You are currently offline. Some features may be unavailable.
      </Text>
    </View>
  );
};

export default OfflineMode;
