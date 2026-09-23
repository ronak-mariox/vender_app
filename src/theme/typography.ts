export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const fontFamilies = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extrabold: 'Inter-ExtraBold',
  black: 'Inter-Black',
} as const;

export const typography = {
  h1: { fontFamily: fontFamilies.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.84 },
  h2: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 33, letterSpacing: -0.44 },
  h3: { fontFamily: fontFamilies.bold, fontSize: 20, lineHeight: 30, letterSpacing: -0.4 },
  bodyLarge: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 26 },
  body: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 21 },
  bodySemibold: { fontFamily: fontFamilies.semibold, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: fontFamilies.medium, fontSize: 13, lineHeight: 19.5 },
  labelSemibold: { fontFamily: fontFamilies.semibold, fontSize: 13, lineHeight: 19.5 },
  caption: { fontFamily: fontFamilies.regular, fontSize: 12, lineHeight: 18 },
  captionSemibold: { fontFamily: fontFamilies.semibold, fontSize: 12, lineHeight: 16.8 },
  captionBold: { fontFamily: fontFamilies.bold, fontSize: 12, lineHeight: 16.8 },
  tiny: { fontFamily: fontFamilies.regular, fontSize: 11, lineHeight: 16.5 },
  tinyBold: { fontFamily: fontFamilies.bold, fontSize: 11, lineHeight: 16.5 },
  button: { fontFamily: fontFamilies.semibold, fontSize: 15, lineHeight: 22.5 },
  otpDigit: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 27 },
  phoneDigit: { fontFamily: fontFamilies.medium, fontSize: 17, lineHeight: 25.5, letterSpacing: 0.85 },
} as const;

export type TypographyToken = keyof typeof typography;
