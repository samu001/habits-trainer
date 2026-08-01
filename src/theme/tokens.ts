export const colors = {
  // Training Arc palette: midnight ink + warm gold + cream
  background: '#F6F1E8',
  backgroundDeep: '#14213D',
  surface: '#FFFDF8',
  surfaceMuted: '#EFE6D8',
  surfaceInk: '#1B2A4A',
  primary: '#C9A227',
  primaryDark: '#9C7A12',
  primarySoft: '#F3E4B0',
  accent: '#2F6FED',
  accentSoft: '#D9E6FF',
  text: '#14213D',
  textSecondary: '#5C6478',
  textMuted: '#8A8478',
  textOnInk: '#F8F1E3',
  textOnInkMuted: '#C9C1B2',
  border: '#E2D6C4',
  borderStrong: '#CFC0A8',
  success: '#2F8F6B',
  successSoft: '#D9F3E8',
  warning: '#C47F17',
  warningSoft: '#FFE8C2',
  danger: '#C44536',
  dangerSoft: '#F8D7D3',
  shadow: '#0F172A',
  glow: '#E8C547',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  glow: {
    shadowColor: colors.glow,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
