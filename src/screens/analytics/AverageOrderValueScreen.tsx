import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';
import { TrendLineChart } from './TrendLineChart';

type Props = NativeStackScreenProps<AuthStackParamList, 'AverageOrderValue'>;

// Not modeled in AnalyticsContext — illustrative content matching the Figma copy/values exactly.
const TIME_OF_DAY = [
  { label: 'Morning', range: '6–11 AM', value: '₹184' },
  { label: 'Afternoon', range: '11–4 PM', value: '₹220' },
  { label: 'Evening', range: '4–9 PM', value: '₹267' },
  { label: 'Night', range: '9 PM+', value: '₹198' },
];

const CATEGORY_AOV = [
  { label: 'Dairy', value: 156 },
  { label: 'Staples', value: 248 },
  { label: 'Beverages', value: 196 },
  { label: 'Snacks', value: 142 },
];

const AOV_TIPS = [
  'Bundle complementary products together',
  'Set ₹300+ free delivery threshold',
  'Suggest add-ons at checkout',
  'Offer quantity discounts on staples',
];

export function AverageOrderValueScreen({ navigation }: Props) {
  const { kpiStats, revenueTrend, period, setPeriod } = useAnalytics();

  const avgOrder = kpiStats.find(stat => stat.key === 'avgOrder');
  const changeBadge = avgOrder?.changeLabel.split(' vs')[0] ?? '';

  // AOV isn't tracked as its own trend series in AnalyticsContext — derive an
  // illustrative trend by rescaling the shared revenue trend into an AOV-like range.
  const aovTrend = useMemo(() => {
    const min = Math.min(...revenueTrend);
    const max = Math.max(...revenueTrend);
    const range = max - min || 1;
    return revenueTrend.map(value => Math.round(190 + ((value - min) / range) * 40));
  }, [revenueTrend]);

  const maxCategoryValue = Math.max(...CATEGORY_AOV.map(item => item.value));

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Avg Order Value" onBack={() => navigation.goBack()} />

      <View style={styles.filterBarWrap}>
        <AnalyticsFilterBar value={period} onChange={setPeriod} />
      </View>

      <View style={styles.section}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Average Order Value</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{avgOrder?.value ?? '—'}</Text>
            {changeBadge ? (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{changeBadge}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.heroChart}>
            <TrendLineChart data={aovTrend} height={60} color={colors.warning} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AOV by Time of Day</Text>
        <View style={styles.timeRow}>
          {TIME_OF_DAY.map(item => (
            <View key={item.label} style={styles.timeCard}>
              <Text style={styles.timeLabel}>{item.label}</Text>
              <Text style={styles.timeRange}>{item.range}</Text>
              <Text style={styles.timeValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AOV by Category</Text>
        <View style={styles.categoryList}>
          {CATEGORY_AOV.map(item => (
            <View key={item.label} style={styles.categoryRow}>
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.categoryLabel}>{item.label}</Text>
                <Text style={styles.categoryValue}>₹{item.value}</Text>
              </View>
              <View style={styles.categoryTrack}>
                <View
                  style={[
                    styles.categoryFill,
                    { width: `${(item.value / maxCategoryValue) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.tipsSection]}>
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeaderRow}>
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={styles.tipsHeaderText}>How to Increase AOV</Text>
          </View>
          {AOV_TIPS.map(tip => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  tipsSection: {
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    backgroundColor: colors.warningSurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.warningDark,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 30,
    lineHeight: 45,
    color: colors.textPrimary,
  },
  heroBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  heroBadgeText: {
    ...typography.captionSemibold,
    lineHeight: 18,
    color: colors.white,
  },
  heroChart: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  timeLabel: {
    ...typography.tinyBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  timeRange: {
    ...typography.tiny,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timeValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  categoryList: {
    gap: spacing.lg,
  },
  categoryRow: {
    gap: spacing.xs,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
  },
  categoryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  categoryTrack: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  categoryFill: {
    height: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.warning,
  },
  tipsCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipsHeaderText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  tipText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
});
