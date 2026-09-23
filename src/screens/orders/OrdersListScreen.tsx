import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { OrderRow } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { Order, OrderStatus, useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { openOrder } from './navigateToOrder';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrdersList'>;

type TabKey = 'all' | 'new' | 'active' | 'done' | 'cancelled' | 'failed';

const ACTIVE_STATUSES: OrderStatus[] = [
  'preparing',
  'quality-check',
  'packing',
  'ready-for-dispatch',
  'dispatched',
];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'failed', label: 'Failed' },
];

type SummaryTile = {
  status: OrderStatus;
  label: string;
  icon: IconName;
  color: string;
  background: string;
  target: keyof AuthStackParamList;
};

const SUMMARY_TILES: SummaryTile[] = [
  { status: 'new', label: 'New', icon: 'shopping-cart', color: '#1570EF', background: '#EFF8FF', target: 'NewOrders' },
  { status: 'preparing', label: 'Preparing', icon: 'package', color: colors.warningDark, background: colors.warningSurface, target: 'PreparingOrders' },
  { status: 'quality-check', label: 'Quality', icon: 'check-circle', color: '#7C3AED', background: '#F5F3FF', target: 'QualityCheckOrders' },
  { status: 'packing', label: 'Packing', icon: 'layers', color: '#EA580C', background: '#FFF7ED', target: 'PackingOrders' },
  { status: 'ready-for-dispatch', label: 'Ready', icon: 'truck', color: '#0891B2', background: '#ECFEFF', target: 'ReadyForDispatchOrders' },
  { status: 'dispatched', label: 'Dispatched', icon: 'truck', color: '#4338CA', background: '#EEF2FF', target: 'DispatchedOrders' },
  { status: 'completed', label: 'Completed', icon: 'check-circle', color: colors.primary, background: colors.primarySurface, target: 'CompletedOrders' },
];

function matchesTab(order: Order, tab: TabKey) {
  if (tab === 'all') return true;
  if (tab === 'new') return order.status === 'new';
  if (tab === 'active') return ACTIVE_STATUSES.includes(order.status);
  if (tab === 'done') return order.status === 'completed';
  if (tab === 'cancelled') return order.status === 'cancelled';
  return order.status === 'failed';
}

export function OrdersListScreen({ navigation }: Props) {
  const { orders } = useOrders();
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');

  const tabCounts = useMemo(
    () =>
      TABS.reduce<Record<TabKey, number>>((acc, item) => {
        acc[item.key] = orders.filter(order => matchesTab(order, item.key)).length;
        return acc;
      }, {} as Record<TabKey, number>),
    [orders],
  );

  const tileCounts = useMemo(
    () =>
      SUMMARY_TILES.reduce<Record<OrderStatus, number>>((acc, tile) => {
        acc[tile.status] = orders.filter(order => order.status === tile.status).length;
        return acc;
      }, {} as Record<OrderStatus, number>),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter(order => {
      if (!matchesTab(order, tab)) return false;
      if (!normalizedQuery) return true;
      return (
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [orders, tab, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>Today · 06 Sep 2026</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => Alert.alert('Notifications', 'Coming soon.')}>
          <Icon name="bell" size={16} color={colors.textPrimary} />
          <View style={styles.notificationDot} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => Alert.alert('Filter Orders', 'Coming soon.')}>
          <Icon name="sliders" size={15} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders, customers..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(item => {
            const active = item.key === tab;
            return (
              <Pressable
                key={item.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item.label} ({tabCounts[item.key]})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
        {SUMMARY_TILES.map(tile => (
          <Pressable
            key={tile.status}
            style={[styles.summaryTile, { backgroundColor: tile.background }]}
            onPress={() => navigation.navigate(tile.target as never)}
          >
            <View style={styles.summaryTileTop}>
              <Icon name={tile.icon} size={13} color={tile.color} />
              {tile.status === 'new' && tileCounts[tile.status] > 0 ? <View style={styles.summaryDot} /> : null}
            </View>
            <Text style={[styles.summaryValue, { color: tile.color }]}>{tileCounts[tile.status]}</Text>
            <Text style={[styles.summaryLabel, { color: tile.color }]}>{tile.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {visibleOrders.map(order => (
          <OrderRow key={order.id} order={order} onPress={() => openOrder(navigation, order)} />
        ))}
        {visibleOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="package" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No orders here</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 9999,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  tabsWrapper: {
    marginTop: spacing.lg,
  },
  tabsRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  summaryRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  summaryTile: {
    width: 76,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
  },
  summaryTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.error,
    marginLeft: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fontFamilies.extrabold,
  },
  summaryLabel: {
    ...typography.tiny,
    fontSize: 10,
    fontFamily: fontFamilies.semibold,
  },
  list: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
