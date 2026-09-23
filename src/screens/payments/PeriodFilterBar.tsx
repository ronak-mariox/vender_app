import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export type PaymentsPeriod = 'today' | 'week' | 'month' | 'custom';

const PERIODS: { key: PaymentsPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

type Props = {
  value: PaymentsPeriod;
  onChange: (value: PaymentsPeriod) => void;
};

export function PeriodFilterBar({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PERIODS.map(period => {
        const active = period.key === value;
        return (
          <Pressable
            key={period.key}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(period.key)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{period.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelActive: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
});
