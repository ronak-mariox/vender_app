import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendDirection } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#B45309'];

type Props = {
  rank: number;
  name: string;
  subtitle: string;
  amount: string;
  trend: TrendDirection;
};

export function RankedProductRow({ rank, name, subtitle, amount, trend }: Props) {
  const badgeColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.surface;
  const badgeTextColor = rank <= 3 ? colors.white : colors.textSecondary;
  const rowTint = rank <= 3 ? `${RANK_COLORS[rank - 1]}08` : 'transparent';

  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? colors.primary : trend === 'down' ? colors.error : colors.textSecondary;

  return (
    <View style={[styles.row, { backgroundColor: rowTint }]}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: badgeTextColor }]}>{rank <= 3 ? `${rank}${ordinalSuffix(rank)}` : rank}</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.amountColumn}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={[styles.trend, { color: trendColor }]}>{trendSymbol}</Text>
      </View>
    </View>
  );
}

function ordinalSuffix(n: number) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeText: {
    ...typography.tinyBold,
    fontSize: 9,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.label,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  trend: {
    ...typography.caption,
  },
});
