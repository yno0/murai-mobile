import React from "react";
import { Text, View } from "react-native";
import { COLORS } from "../../constants/theme";

const BG = COLORS.BG;
const CARD_BG = COLORS.CARD_BG;
const ACCENT = COLORS.ACCENT;
const TEXT_MAIN = COLORS.TEXT_MAIN;
const TEXT_SECONDARY = COLORS.TEXT_SECONDARY;

const Feedback = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BG }}>
    <Text style={{ color: TEXT_MAIN, fontSize: 24, fontWeight: "bold" }}>Feedback</Text>
    <Text style={{ color: TEXT_SECONDARY, marginTop: 12, fontSize: 16 }}>
      Feedback form or information will appear here.
    </Text>
  </View>
);

export default Feedback;
