// Font Update Utility
// This file contains common font mappings to help update all screens

export const FONT_MAPPINGS = {
  // Replace fontWeight with fontFamily
  'fontWeight: "bold"': 'fontFamily: "Poppins-Bold"',
  'fontWeight: "600"': 'fontFamily: "Poppins-SemiBold"',
  'fontWeight: "500"': 'fontFamily: "Poppins-Medium"',
  'fontWeight: "400"': 'fontFamily: "Poppins-Regular"',
  'fontWeight: "300"': 'fontFamily: "Poppins-Light"',
  'fontWeight: "900"': 'fontFamily: "Poppins-Black"',
  'fontWeight: "700"': 'fontFamily: "Poppins-Bold"',
  'fontWeight: "200"': 'fontFamily: "Poppins-ExtraLight"',
  'fontWeight: "100"': 'fontFamily: "Poppins-Thin"',
  
  // Common patterns
  'fontWeight: \'bold\'': 'fontFamily: "Poppins-Bold"',
  'fontWeight: \'600\'': 'fontFamily: "Poppins-SemiBold"',
  'fontWeight: \'500\'': 'fontFamily: "Poppins-Medium"',
  'fontWeight: \'400\'': 'fontFamily: "Poppins-Regular"',
  'fontWeight: \'300\'': 'fontFamily: "Poppins-Light"',
  'fontWeight: \'900\'': 'fontFamily: "Poppins-Black"',
  'fontWeight: \'700\'': 'fontFamily: "Poppins-Bold"',
  'fontWeight: \'200\'': 'fontFamily: "Poppins-ExtraLight"',
  'fontWeight: \'100\'': 'fontFamily: "Poppins-Thin"',
};

export const COLOR_MAPPINGS = {
  // Update old color references
  'COLORS.ACCENT': 'COLORS.PRIMARY',
  'COLORS.TEXT_SECONDARY': 'COLORS.TEXT_MUTED',
  'COLORS.GLASS_BG': 'globalStyles.card',
  'COLORS.CARD_BG': 'COLORS.CARD_BG',
};

export const STYLE_MAPPINGS = {
  // Common style replacements
  'backgroundColor: COLORS.GLASS_BG': 'style: globalStyles.card',
  'backgroundColor: COLORS.CARD_BG': 'style: globalStyles.card',
};

// Common text styles that should be updated
export const TEXT_STYLES_TO_UPDATE = [
  'fontWeight: "bold"',
  'fontWeight: "600"',
  'fontWeight: "500"',
  'fontWeight: "400"',
  'fontWeight: "300"',
  'fontWeight: "900"',
  'fontWeight: "700"',
  'fontWeight: "200"',
  'fontWeight: "100"',
  'fontWeight: \'bold\'',
  'fontWeight: \'600\'',
  'fontWeight: \'500\'',
  'fontWeight: \'400\'',
  'fontWeight: \'300\'',
  'fontWeight: \'900\'',
  'fontWeight: \'700\'',
  'fontWeight: \'200\'',
  'fontWeight: \'100\'',
];

// Screens that need to be updated
export const SCREENS_TO_UPDATE = [
  // 'app/screens/Group/GroupDetails.jsx',
  // 'app/screens/Group/MemberAnalytics.jsx',
  // 'app/screens/Group/AllFlaggedPhrases.jsx',
  'app/screens/Profile/PrivacyControls.jsx',
  'app/screens/Profile/NotificationPreferences.jsx',
];

// Helper function to get appropriate font family based on weight
export const getFontFamily = (weight) => {
  const weightMap = {
    'bold': 'Poppins-Bold',
    '600': 'Poppins-SemiBold',
    '500': 'Poppins-Medium',
    '400': 'Poppins-Regular',
    'regular': 'Poppins-Regular',
    '300': 'Poppins-Light',
    '900': 'Poppins-Black',
    '700': 'Poppins-Bold',
    '200': 'Poppins-ExtraLight',
    '100': 'Poppins-Thin',
  };
  
  return weightMap[weight] || 'Poppins-Regular';
}; 