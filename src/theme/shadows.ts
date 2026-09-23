import { Platform, ViewStyle } from 'react-native';

function shadow(elevation: number, opacity: number, radius: number, offsetY: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  none: {},
  xs: shadow(1, 0.06, 2, 1),
  sm: shadow(2, 0.08, 8, 4),
  md: shadow(4, 0.08, 10, 4),
  lg: shadow(6, 0.1, 16, 4),
} as const;
