import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon, IconName } from '../../icons/Icon';
import { KpiStat, useAnalytics } from '../../context/AnalyticsContext';
import { colors, radii, spacing, typography } from '../../theme';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { KpiStatCard } from './KpiStatCard';
import { TrendLineChart } from './TrendLineChart';
import { formatDayLabel } from './analyticsHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'AnalyticsOverview'>;

type ReportRoute =
  | 'SalesAnalytics'
  | 'OrdersAnalytics'
  | 'AverageOrderValue'
  | 'BestSellingProducts'
  | 'LowPerformingProducts'
  | 'InventoryPerformance'
  | 'CancellationAnalytics';

type ReportTile = {
  key: string;
  label: string;
  icon: IconName;
  route: ReportRoute;
};

const REPORT_TILES: ReportTile[] = [
  { key: 'sales', label: 'Sales', icon: 'grid', route: 'SalesAnalytics' },
  { key: 'orders', label: 'Orders', icon: 'package', route: 'OrdersAnalytics' },
  { key: 'best', label: 'Best Sellers', icon: 'award', route: 'BestSellingProducts' },
  { key: 'low', label: 'Low Performers', icon: 'alert-triangle', route: 'LowPerformingProducts' },
  { key: 'inventory', label: 'Inventory', icon: 'layers', route: 'InventoryPerformance' },
  { key: 'cancels', label: 'Cancels', icon: 'x-circle', route: 'CancellationAnalytics' },
];

const KPI_ROUTES: Record<KpiStat['key'], ReportRoute> = {
  revenue: 'SalesAnalytics',
  orders: 'OrdersAnalytics',
  avgOrder: 'AverageOrderValue',
  cancelled: 'CancellationAnalytics',
};

export function AnalyticsOverviewScreen({ navigation }: Props) {
  const { kpiStats, revenueTrend, revenueDates, periodLabel, isLoading, refresh } = useAnalytics();
  const firstDay = formatDayLabel(revenueDates[0]);
  const lastDay = formatDayLabel(revenueDates[revenueDates.length - 1]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading && kpiStats.length > 0} onRefresh={refresh} />}
      >
        <View style={styles.filterBarWrap}>
          <AnalyticsFilterBar />
        </View>

        <View style={styles.kpiGrid}>
          {kpiStats.map(stat => (
            <KpiStatCard key={stat.key} stat={stat} onPress={() => navigation.navigate(KPI_ROUTES[stat.key])} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <Text style={styles.sectionSubtitle}>{periodLabel}</Text>
          </View>
          <View style={styles.chartCard}>
            <TrendLineChart data={revenueTrend} height={100} />
            {revenueDates.length > 1 ? (
              <View style={styles.chartAxisRow}>
                <Text style={styles.sectionSubtitle}>{firstDay}</Text>
                <Text style={styles.sectionSubtitle}>{lastDay}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Explore Reports</Text>
          <View style={styles.tileRow}>
            {REPORT_TILES.map(tile => (
              <Pressable key={tile.key} style={styles.tile} onPress={() => navigation.navigate(tile.route)}>
                <Icon name={tile.icon} size={20} color={colors.primary} />
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {tile.label}
                </Text>
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
  chartAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  tile: {
    width: '30%',
    flexGrow: 1,
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
