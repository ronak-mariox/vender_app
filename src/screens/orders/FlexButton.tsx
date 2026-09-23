import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { radii, spacing, typography } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  background: string;
  textColor: string;
  borderColor?: string;
  flex?: number;
  disabled?: boolean;
};

export function FlexButton({ label, onPress, background, textColor, borderColor, flex = 1, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        { flex, backgroundColor: background },
        borderColor ? { borderWidth: 1.5, borderColor } : null,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    ...typography.button,
    fontSize: 14,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
