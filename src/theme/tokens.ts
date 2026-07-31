export const colors = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F8',
  primary: '#5B6CFF',
  primaryDark: '#4050E0',
  primarySoft: '#E8EBFF',
  text: '#121826',
  textSecondary: '#5B6475',
  textMuted: '#8B93A7',
  border: '#D9E1F0',
  borderStrong: '#C7D0E0',
  success: '#1F9D6C',
  successSoft: '#E6F7F0',
  warning: '#C47F17',
  warningSoft: '#FFF4E5',
  danger: '#D64545',
  shadow: '#1B2437',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const typography = {
  eyebrow: {
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};
