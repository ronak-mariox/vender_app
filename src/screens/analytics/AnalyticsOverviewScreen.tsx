import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon, IconName } from '../../icons/Icon';
import { KpiStat, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar, AnalyticsPeriod } from './AnalyticsFilterBar';
import { KpiStatCard } from './KpiStatCard';
import { TrendLineChart } from './TrendLineChart';

type Props = NativeStackScreenProps<AuthStackParamList, 'AnalyticsOverview'>;

type ReportTile = {
  key: string;
  label: string;
  icon: IconName;
  route: keyof AuthStackParamList;
};

const REPORT_TILES: ReportTile[] = [
  { key: 'sales', label: 'Sales', icon: 'grid', route: 'SalesAnalytics' },
  { key: 'orders', label: 'Orders', icon: 'package', route: 'OrdersAnalytics' },
  { key: 'products', label: 'Products', icon: 'layers', route: 'BestSellingProducts' },
  { key: 'cancels', label: 'Cancels', icon: 'x-circle', route: 'CancellationAnalytics' },
];

const KPI_ROUTES: Record<KpiStat['key'], keyof AuthStackParamList> = {
  revenue: 'RevenueAnalytics',
  orders: 'OrdersAnalytics',
  avgOrder: 'AverageOrderValue',
  cancelled: 'CancellationAnalytics',
};

export function AnalyticsOverviewScreen({ navigation }: Props) {
  const { kpiStats, revenueTrend, period, setPeriod } = useAnalytics();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Pressable hitSlop={8} onPress={() => {}}>
          <Icon name="sliders" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar value={period} onChange={setPeriod} />
        </View>

        <View style={styles.kpiGrid}>
          {kpiStats.map(stat => (
            <KpiStatCard
              key={stat.key}
              stat={stat}
              onPress={() => navigation.navigate(KPI_ROUTES[stat.key] as never)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <Text style={styles.sectionSubtitle}>Last 30 days</Text>
          </View>
          <View style={styles.chartCard}>
            <TrendLineChart data={revenueTrend} height={100} />
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Explore Reports</Text>
          <View style={styles.tileRow}>
            {REPORT_TILES.map(tile => (
              <Pressable
                key={tile.key}
                style={styles.tile}
                onPress={() => navigation.navigate(tile.route as never)}
              >
                <Icon name={tile.icon} size={20} color={colors.primary} />
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.huge,
  },
  filterBarWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  lastSection: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chartCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  tileLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.textPrimary,
  },
});
