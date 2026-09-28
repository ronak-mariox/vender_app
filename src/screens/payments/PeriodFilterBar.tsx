import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { PAYMENTS_PERIOD_LABELS, PaymentsPeriod, usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';

const PERIODS = (Object.keys(PAYMENTS_PERIOD_LABELS) as PaymentsPeriod[]).map(key => ({
  key,
  label: PAYMENTS_PERIOD_LABELS[key],
}));

/** Drives the shared PaymentsContext period, so every payments screen filters the same way. */
export function PeriodFilterBar() {
  const { period: value, setPeriod: onChange } = usePayments();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
    </ScrollView>
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
