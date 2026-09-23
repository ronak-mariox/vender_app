import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KpiStat } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { Sparkline } from './Sparkline';

type Props = {
  stat: KpiStat;
  onPress?: () => void;
};

export function KpiStatCard({ stat, onPress }: Props) {
  const changeColor = stat.direction === 'down' ? colors.error : colors.primary;
  const sparkColor = stat.direction === 'down' ? colors.error : colors.primary;

  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{stat.label}</Text>
        <Sparkline data={stat.sparkline} color={sparkColor} />
      </View>
      <Text style={styles.value}>{stat.value}</Text>
      <Text style={[styles.change, { color: changeColor }]}>{stat.changeLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.label,
    fontSize: 11,
    color: colors.textSecondary,
  },
  value: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
  },
  change: {
    ...typography.tiny,
    fontWeight: '500',
    paddingTop: 2,
  },
});
