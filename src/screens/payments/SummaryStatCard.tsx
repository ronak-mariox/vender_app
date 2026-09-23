import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  label: string;
  value: string;
  sublabel: string;
  valueColor?: string;
  sublabelColor?: string;
};

export function SummaryStatCard({ label, value, sublabel, valueColor, sublabelColor }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={[styles.sublabel, sublabelColor ? { color: sublabelColor } : null]}>{sublabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: 2,
  },
  label: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  value: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  sublabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
