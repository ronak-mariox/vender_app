import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type Props = {
  lastUpdatedLabel: string;
  effectiveLabel?: string;
  scrollProgress?: number;
};

export function PolicyMetaBar({ lastUpdatedLabel, effectiveLabel, scrollProgress }: Props) {
  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.row}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>{lastUpdatedLabel}</Text>
        </View>
        {effectiveLabel ? (
          <View style={styles.row}>
            <Text style={styles.label}>Effective:</Text>
            <Text style={styles.value}>{effectiveLabel}</Text>
          </View>
        ) : null}
      </View>
      {scrollProgress !== undefined ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, scrollProgress))}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.captionSemibold,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  track: {
    height: 3,
    width: '100%',
    backgroundColor: colors.border,
  },
  fill: {
    height: 3,
    backgroundColor: colors.primary,
  },
});
