import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ANALYTICS_PERIOD_LABELS, AnalyticsPeriod, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';

const PERIODS = (Object.keys(ANALYTICS_PERIOD_LABELS) as AnalyticsPeriod[]).map(key => ({
  key,
  label: ANALYTICS_PERIOD_LABELS[key],
}));

/** Period pills bound to AnalyticsContext, plus the shared loading/error line for every analytics screen. */
export function AnalyticsFilterBar() {
  const { period, setPeriod, isLoading, error, refresh } = useAnalytics();
  return (
    <View>
      <View style={styles.row}>
        {PERIODS.map(item => {
          const active = item.key === period;
          return (
            <Pressable
              key={item.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setPeriod(item.key)}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
        {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      </View>
      {error ? (
        <Pressable style={styles.errorBox} onPress={refresh}>
          <Text style={styles.errorText}>{error} Tap to retry.</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelActive: {
    ...typography.labelSemibold,
    color: colors.white,
  },
});
