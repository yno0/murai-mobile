// Banking app theme with dark purple and white design
export const COLORS = {
  // Primary dark purple colors
  PRIMARY: "#374151", // Main dark gray
  PRIMARY_DARK: "#1F2937", // Darker gray for pressed states
  PRIMARY_LIGHT: "#F3F4F6", // Light gray for backgrounds
  PRIMARY_GLASS: "rgba(55, 65, 81, 0.1)", // Transparent gray
  
  // Background colors
  BG: "#FFFFFF", // Main white background
  CARD_BG: "#FFFFFF", // Card backgrounds
  GLASS_BG: "rgba(55, 65, 81, 0.05)", // Subtle gray tint
  INPUT_BG: "#F8F9FA", // Light gray input background
  NAV_BG: "#FFFFFF", // Navigation background
  HEADER_BG: "#374151", // Dark gray header background
  
  // Text colors
  TEXT_MAIN: "#111827", // Primary dark text
  TEXT_SECONDARY: "#6B7280", // Secondary gray text
  TEXT_MUTED: "#9CA3AF", // Muted text for labels
  TEXT_WHITE: "#FFFFFF", // White text for dark backgrounds
  TEXT_SUCCESS: "#10B981", // Green for positive amounts
  TEXT_ERROR: "#EF4444", // Red for negative amounts
  
  // Interactive elements
  ACCENT: "#374151", // Dark gray accent
  FOCUS: "#4B5563", // Focus state gray
  GRAY_BTN: "#F3F4F6", // Light gray button
  SUBTLE: "#E5E7EB", // Subtle borders
  INACTIVE: "#D1D5DB", // Inactive elements
  
  // Status colors
  ERROR: "#EF4444", // Red for errors
  WARNING: "#F59E0B", // Amber for warnings
  SUCCESS: "#10B981", // Green for success
  
  // Borders and shadows
  BORDER: "#E5E7EB", // Light gray borders
  SHADOW: "rgba(0, 0, 0, 0.1)", // Subtle shadows
  CARD_SHADOW: "rgba(55, 65, 81, 0.1)", // Gray tinted shadows
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT = {
  // Font family - Poppins with fallbacks
  family: {
    thin: "Poppins-Thin, system-ui",
    thinItalic: "Poppins-ThinItalic, system-ui",
    extraLight: "Poppins-ExtraLight, system-ui",
    extraLightItalic: "Poppins-ExtraLightItalic, system-ui",
    light: "Poppins-Light, system-ui",
    lightItalic: "Poppins-LightItalic, system-ui",
    regular: "Poppins-Regular, system-ui",
    italic: "Poppins-Italic, system-ui",
    medium: "Poppins-Medium, system-ui",
    mediumItalic: "Poppins-MediumItalic, system-ui",
    semibold: "Poppins-SemiBold, system-ui",
    semiboldItalic: "Poppins-SemiBoldItalic, system-ui",
    bold: "Poppins-Bold, system-ui",
    boldItalic: "Poppins-BoldItalic, system-ui",
    extraBold: "Poppins-ExtraBold, system-ui",
    extraBoldItalic: "Poppins-ExtraBoldItalic, system-ui",
    black: "Poppins-Black, system-ui",
    blackItalic: "Poppins-BlackItalic, system-ui",
  },
  
  // Font sizes
  xs: 12,
  sm: 14,
  regular: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  xxxlarge: 28,
  
  // Font weights with Poppins family and fallbacks
  light: "Poppins-Light, system-ui",
  weightRegular: "Poppins-Regular, system-ui",
  medium: "Poppins-Medium, system-ui",
  semibold: "Poppins-SemiBold, system-ui",
  bold: "Poppins-Bold, system-ui",
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Accessibility scaling
  getScaledFontSize: (baseSize, scaleFactor = 1) => {
    return Math.round(baseSize * scaleFactor);
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Global styles consolidated into theme
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  
  text: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.regular,
    fontFamily: FONT.weightRegular,
    lineHeight: FONT.lineHeight.normal,
  },
  
  textLarge: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.large,
    fontFamily: FONT.medium,
    lineHeight: FONT.lineHeight.normal,
  },
  
  textSmall: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.sm,
    fontFamily: FONT.weightRegular,
    lineHeight: FONT.lineHeight.normal,
  },
  
  // Banking app specific text styles
  balanceText: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.xxxlarge,
    fontFamily: FONT.bold,
    lineHeight: FONT.lineHeight.tight,
  },
  
  balanceLabel: {
    color: COLORS.TEXT_MUTED,
    fontSize: FONT.sm,
    fontFamily: FONT.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  amountPositive: {
    color: COLORS.TEXT_SUCCESS,
    fontSize: FONT.regular,
    fontFamily: FONT.semibold,
  },
  
  amountNegative: {
    color: COLORS.TEXT_ERROR,
    fontSize: FONT.regular,
    fontFamily: FONT.semibold,
  },
  
  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOWS.md,
  },
  
  // Financial insight card style
  insightCard: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 0,
    ...SHADOWS.sm,
  },
  
  // Balance card style
  balanceCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    borderWidth: 0,
    ...SHADOWS.lg,
  },
  
  input: {
    backgroundColor: COLORS.INPUT_BG,
    color: COLORS.TEXT_MAIN,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT.regular,
    fontFamily: FONT.weightRegular,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  
  buttonText: {
    color: COLORS.TEXT_WHITE,
    fontSize: FONT.regular,
    fontFamily: FONT.semibold,
  },
  
  buttonSecondary: {
    backgroundColor: COLORS.GRAY_BTN,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  
  buttonSecondaryText: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.regular,
    fontFamily: FONT.semibold,
  },
  
  // Action button style for quick actions
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.full,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  
  header: {
    backgroundColor: COLORS.HEADER_BG,
    borderBottomWidth: 0,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  
  headerTitle: {
    color: COLORS.TEXT_WHITE,
    fontSize: FONT.xlarge,
    fontFamily: FONT.semibold,
  },
  
  headerSubtitle: {
    color: COLORS.TEXT_WHITE,
    fontSize: FONT.regular,
    fontFamily: FONT.weightRegular,
    opacity: 0.9,
  },
  
  tabBar: {
    backgroundColor: COLORS.NAV_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    ...SHADOWS.sm,
  },
  
  // Transaction item style
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  
  // Quick action container
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  
  quickActionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  quickActionText: {
    color: COLORS.TEXT_MAIN,
    fontSize: FONT.xs,
    fontFamily: FONT.medium,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
};

// Accessibility settings
export const ACCESSIBILITY = {
  minTouchTarget: 44,
  focusIndicator: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.xs,
  },
  highContrast: {
    BG: "#000000",
    TEXT: "#FFFFFF",
    ACCENT: "#FFFFFF",
    BORDER: "#FFFFFF",
  },
}; 