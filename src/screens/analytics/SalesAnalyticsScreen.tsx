import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';
import { TrendLineChart } from './TrendLineChart';

type Props = NativeStackScreenProps<AuthStackParamList, 'SalesAnalytics'>;

// Not modeled in AnalyticsContext — illustrative content matching Figma's exact copy.
const QUICK_STATS = [
  { label: 'Peak Hour', value: '6–8 PM' },
  { label: 'Best Day', value: 'Tuesday' },
  { label: 'Avg Daily', value: '₹5,946' },
];

// Not modeled in AnalyticsContext — illustrative category split matching Figma's exact copy.
const CATEGORY_BREAKDOWN = [
  { name: 'Dairy', amount: '₹52,840 · 29%', percent: 29, color: colors.primary },
  { name: 'Staples', amount: '₹44,230 · 24%', percent: 24, color: '#3B82F6' },
  { name: 'Beverages', amount: '₹36,820 · 20%', percent: 20, color: '#F59E0B' },
  { name: 'Snacks', amount: '₹27,460 · 15%', percent: 15, color: '#8B5CF6' },
  { name: 'Personal Care', amount: '₹22,970 · 12%', percent: 12, color: '#EC4899' },
];

export function SalesAnalyticsScreen({ navigation }: Props) {
  const { kpiStats, revenueTrend, period, setPeriod } = useAnalytics();
  const revenue = kpiStats.find(stat => stat.key === 'revenue');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Sales Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Revenue</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{revenue?.value ?? '—'}</Text>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{revenue?.changeLabel.replace(' vs last week', '') ?? ''}</Text>
              </View>
            </View>
            <View style={styles.heroChart}>
              <TrendLineChart data={revenueTrend} height={100} />
            </View>
          </View>
        </View>

        <View style={styles.statsRowWrap}>
          <View style={styles.statsRow}>
            {QUICK_STATS.map((stat, index) => (
              <View
                key={stat.label}
                style={[styles.statCell, index < QUICK_STATS.length - 1 && styles.statCellDivider]}
              >
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <View style={styles.categoryList}>
            {CATEGORY_BREAKDOWN.map(category => (
              <View key={category.name} style={styles.categoryRow}>
                <View style={styles.categoryHeaderRow}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>{category.amount}</Text>
                </View>
                <View style={styles.categoryTrack}>
                  <View
                    style={[
                      styles.categoryFill,
                      { width: `${category.percent}%`, backgroundColor: category.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.huge,
  },
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  heroWrap: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.primary,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroValue: {
    ...typography.h1,
    fontSize: 28,
    lineHeight: 42,
    letterSpacing: 0,
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
    color: colors.white,
  },
  heroChart: {
    paddingTop: spacing.lg,
  },
  statsRowWrap: {
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  statCellDivider: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statValue: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryList: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  categoryRow: {
    gap: spacing.xs,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    ...typography.label,
    color: colors.textPrimary,
  },
  categoryAmount: {
    ...typography.label,
    color: colors.textSecondary,
  },
  categoryTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  categoryFill: {
    height: 8,
    borderRadius: radii.sm,
  },
});
