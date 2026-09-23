export const colors = {
  // Brand
  primary: '#1CA672',
  primaryDark: '#158A5C',
  primarySurface: '#E8F5EF',
  primaryBorder: '#D1EEE2',
  primaryFocusRing: '#D1EEE2',

  // Neutrals
  textPrimary: '#1F2937',
  textSecondary: '#667085',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#F7F9F8',
  surfaceAlt: '#F9FAFB',
  background: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  // Semantic - error
  error: '#D92D20',
  errorDark: '#B42318',
  errorSurface: '#FEF3F2',
  errorBorder: '#FDA29B',
  errorFocusRing: '#FEE4E2',

  // Semantic - warning
  warning: '#F79009',
  warningDark: '#B54708',
  warningSurface: '#FFFAEB',

  // Overlay / misc
  overlayLight: 'rgba(255,255,255,0.85)',
  overlayLight50: 'rgba(255,255,255,0.5)',
  overlayLight40: 'rgba(255,255,255,0.4)',
  overlayDark15: 'rgba(0,0,0,0.15)',
} as const;

export type ColorToken = keyof typeof colors;
