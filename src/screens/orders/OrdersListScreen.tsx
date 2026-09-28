import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InfoBanner, OrderRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { Order, ORDER_STATUS_META, OrderStatus, useOrders } from '../../context/OrdersContext';
import { useNotifications } from '../../context/NotificationsContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { openOrder } from './orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrdersList'>;

type TabKey = 'all' | 'new' | 'preparing' | 'ready' | 'out' | 'done' | 'cancelled';

const TAB_STATUSES: Record<Exclude<TabKey, 'all'>, OrderStatus[]> = {
  new: ['placed'],
  preparing: ['accepted', 'preparing'],
  ready: ['ready_for_pickup'],
  out: ['out_for_delivery'],
  done: ['delivered'],
  cancelled: ['cancelled', 'rejected'],
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out', label: 'Out for delivery' },
  { key: 'done', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

type SummaryTile = {
  key: Exclude<TabKey, 'all'>;
  label: string;
  target: keyof AuthStackParamList;
};

const SUMMARY_TILES: SummaryTile[] = [
  { key: 'new', label: 'New', target: 'NewOrders' },
  { key: 'preparing', label: 'Preparing', target: 'PreparingOrders' },
  { key: 'ready', label: 'Ready', target: 'ReadyForDispatchOrders' },
  { key: 'out', label: 'On the way', target: 'DispatchedOrders' },
  { key: 'done', label: 'Completed', target: 'CompletedOrders' },
  { key: 'cancelled', label: 'Cancelled', target: 'CancelledOrders' },
];

const ALL_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

function matchesTab(order: Order, tab: TabKey) {
  if (tab === 'all') return true;
  return TAB_STATUSES[tab].includes(order.status);
}

export function OrdersListScreen({ navigation }: Props) {
  const { orders, loading, error, refreshOrders } = useOrders();
  const { notifications } = useNotifications();
  const hasUnread = notifications.some(item => !item.read);
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<OrderStatus>>(() => new Set());
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshOrders().catch(() => undefined);
    }, [refreshOrders]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshOrders();
    } catch {
      // surfaced via context error
    } finally {
      setRefreshing(false);
    }
  }

  const tabCounts = useMemo(
    () =>
      TABS.reduce<Record<TabKey, number>>((acc, item) => {
        acc[item.key] = orders.filter(order => matchesTab(order, item.key)).length;
        return acc;
      }, {} as Record<TabKey, number>),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter(order => {
      if (!matchesTab(order, tab)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(order.status)) return false;
      if (!normalizedQuery) return true;
      return (
        order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.location.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [orders, tab, query, statusFilter]);

  function toggleStatusFilter(status: OrderStatus) {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>{orders.length} orders</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={16} color={colors.textPrimary} />
          {hasUnread ? <View style={styles.notificationDot} /> : null}
        </Pressable>
        <Pressable
          style={[styles.iconButton, statusFilter.size > 0 && styles.iconButtonActive]}
          onPress={() => setFilterOpen(true)}
        >
          <Icon name="sliders" size={15} color={statusFilter.size > 0 ? colors.primary : colors.textPrimary} />
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
        {SUMMARY_TILES.map(tile => {
          const meta = ORDER_STATUS_META[TAB_STATUSES[tile.key][0]];
          return (
            <Pressable
              key={tile.key}
              style={[styles.summaryTile, { backgroundColor: meta.background }]}
              onPress={() => navigation.navigate(tile.target as never)}
            >
              <View style={styles.summaryTileTop}>
                <Icon name={meta.icon} size={13} color={meta.color} />
                {tile.key === 'new' && tabCounts.new > 0 ? <View style={styles.summaryDot} /> : null}
              </View>
              <Text style={[styles.summaryValue, { color: meta.color }]}>{tabCounts[tile.key]}</Text>
              <Text style={[styles.summaryLabel, { color: meta.color }]}>{tile.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {error && orders.length === 0 ? (
          <View style={styles.bannerWrapper}>
            <InfoBanner variant="error" message={error} />
          </View>
        ) : null}
        {visibleOrders.map(order => (
          <OrderRow key={order.id} order={order} onPress={() => openOrder(navigation, order)} />
        ))}
        {visibleOrders.length === 0 ? (
          <View style={styles.emptyState}>
            {loading && !refreshing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Icon name="package" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>
                  {orders.length === 0 ? 'No orders yet' : 'No orders match this view'}
                </Text>
              </>
            )}
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.menuSheetWrapper} onPress={event => event.stopPropagation()}>
            <SafeAreaView edges={['bottom']} style={styles.menuSheet}>
              <View style={styles.menuHandle} />
              <Text style={styles.menuTitle}>Filter by status</Text>
              {ALL_STATUSES.map(status => {
                const meta = ORDER_STATUS_META[status];
                const checked = statusFilter.has(status);
                return (
                  <Pressable key={status} style={styles.menuOption} onPress={() => toggleStatusFilter(status)}>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
                    </View>
                    <Text style={styles.menuOptionText}>{meta.label}</Text>
                  </Pressable>
                );
              })}
              <View style={styles.menuFooter}>
                <Pressable onPress={() => setStatusFilter(new Set())} hitSlop={8}>
                  <Text style={styles.menuClear}>Clear</Text>
                </Pressable>
                <Pressable onPress={() => setFilterOpen(false)} hitSlop={8}>
                  <Text style={styles.menuDone}>Done</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
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
  iconButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
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
    width: 84,
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
  bannerWrapper: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
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
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheetWrapper: {
    width: '100%',
  },
  menuSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  menuTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingBottom: spacing.sm,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  menuOptionText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  menuClear: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  menuDone: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
});
