import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle } from 'react-native';
import { radii, spacing, typography } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  background: string;
  textColor: string;
  borderColor?: string;
  flex?: number;
  disabled?: boolean;
  height?: number;
  radius?: number;
  fontWeight?: TextStyle['fontWeight'];
  fontSize?: number;
};

export function FlexButton({
  label,
  onPress,
  background,
  textColor,
  borderColor,
  flex = 1,
  disabled,
  height = 52,
  radius = radii.lg,
  fontWeight,
  fontSize = 14,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        // minHeight keeps the button visible inside a column container, where `flex` would collapse its height to 0.
        { flex, height, minHeight: height, borderRadius: radius, backgroundColor: background },
        borderColor ? { borderWidth: 1.5, borderColor } : null,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[styles.label, { color: textColor, fontSize }, fontWeight ? { fontWeight } : null]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.button,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
