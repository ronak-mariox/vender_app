import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, MetricCard, PipelineTile } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { useRegistration } from '../../context/RegistrationContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { ORDER_STATUS_META, useOrders } from '../../context/OrdersContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useDisputes } from '../../context/DisputesContext';
import { resolveVendorEntryRoute } from '../../utils/vendorRouting';
import { api } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Dashboard'>;

type DebugView = 'auto' | 'loading' | 'no-orders' | 'network-error' | 'reconnecting' | 'suspended';

const QUICK_ACTIONS: { icon: IconName; label: string; background: string; color: string }[] = [
  { icon: 'plus', label: 'Add Product', background: colors.primarySurface, color: colors.primary },
  { icon: 'package', label: 'Orders', background: '#EFF8FF', color: '#1570EF' },
  { icon: 'grid', label: 'Inventory', background: '#F5F3FF', color: '#7C3AED' },
  { icon: 'home', label: 'Store', background: colors.warningSurface, color: colors.warningDark },
  { icon: 'tag', label: 'Pricing', background: '#FCE7F3', color: '#DB2777' },
  { icon: 'percent', label: 'Offers', background: '#FFEDD5', color: '#EA580C' },
  { icon: 'credit-card', label: 'Payments', background: '#D1FAE5', color: '#059669' },
  { icon: 'trending-up', label: 'Analytics', background: '#E0F2FE', color: '#0284C7' },
  { icon: 'phone', label: 'Help', background: '#EFF8FF', color: '#1570EF' },
  { icon: 'alert-triangle', label: 'Disputes', background: '#FFFAEB', color: '#B45309' },
];

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type KpiStat = {
  key: 'revenue' | 'orders' | 'avgOrder' | 'cancelled';
  label: string;
  value: string;
  changeLabel: string;
  direction: 'up' | 'down' | 'flat';
  sparkline: number[];
};

type OverviewResponse = { kpiStats: KpiStat[]; revenueTrend: number[]; revenueDates: string[] };

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Pulls the short "12%" out of a full changeLabel like "↑ 12% vs previous period",
 * for the compact trend badge — which only ever makes sense to show on an upward trend. */
function upwardTrendBadge(kpi: KpiStat | undefined) {
  if (!kpi || kpi.direction !== 'up') return undefined;
  const match = kpi.changeLabel.match(/\d+%/);
  return match ? match[0] : undefined;
}

function describeAlertProducts(products: { name: string }[], suffix?: string) {
  const names = products.slice(0, 2).map(p => p.name);
  const extra = products.length > 2 ? ` +${products.length - 2}` : '';
  const countLabel = `${products.length} product${products.length === 1 ? '' : 's'}`;
  return `${countLabel}${suffix ? ` ${suffix}` : ''} · ${names.join(', ')}${extra}`;
}

/** Builds a fixed 7-entry, oldest-to-newest series for the last 7 calendar days,
 * filling in 0 for any day the backend's variable-length, gap-skipping series omits. */
function buildLast7DaysSeries(dates: string[], values: number[]) {
  const valueByDate = new Map(dates.map((d, i) => [d, values[i] ?? 0]));
  const today = new Date();
  const days: { key: string; label: string; value: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);
    days.push({ key, label: WEEKDAY_LETTERS[d.getDay()], value: valueByDate.get(key) ?? 0, isToday: i === 0 });
  }
  return days;
}

const DEBUG_OPTIONS: { value: DebugView; label: string }[] = [
  { value: 'auto', label: 'Live (based on real setup progress)' },
  { value: 'loading', label: 'Loading' },
  { value: 'no-orders', label: 'No Orders Today' },
  { value: 'network-error', label: 'Network Error' },
  { value: 'reconnecting', label: 'Reconnecting' },
  { value: 'suspended', label: 'Suspended' },
];

export function DashboardScreen({ navigation }: Props) {
  const storeSetup = useStoreSetup();
  const registration = useRegistration();
  const { disputes } = useDisputes();
  const [booting, setBooting] = useState(true);
  const [debugView, setDebugView] = useState<DebugView>('auto');
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // StoreSetupContext only fetches once when the app boots (which may be before the
  // vendor has even logged in, or before this store's setup was last changed) — so
  // without this, returning to Dashboard after completing a setup step (or after any
  // change made elsewhere) could still show stale checklist/view state. Refetch every
  // time Dashboard actually gains focus, the moment accuracy matters most.
  useFocusEffect(
    useCallback(() => {
      storeSetup.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Defense in depth: business registration + admin approval is mandatory before the
  // app is usable. Every known entry point already routes correctly, but this guard
  // makes Dashboard itself refuse to stay rendered for an incomplete/unapproved vendor
  // regardless of how it was reached, instead of relying solely on callers behaving.
  // Fails open on a network error — a transient check failure shouldn't bounce a vendor
  // who's already legitimately here.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const route = await resolveVendorEntryRoute();
        if (!cancelled && route.name !== 'Dashboard') {
          (navigation as unknown as { replace: (name: string, params?: object) => void }).replace(
            route.name,
            route.params,
          );
        }
      } catch {
        // Network/server hiccup — stay put rather than bouncing on a transient failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  const storeName =
    storeSetup.data.profile?.storeName ?? registration.data.storeInfo?.storeName ?? 'Your Store';

  const setupComplete = Boolean(
    storeSetup.data.profile &&
      storeSetup.data.logoUploaded &&
      storeSetup.data.coverImageUploaded &&
      storeSetup.data.address &&
      storeSetup.data.operatingHours &&
      storeSetup.data.delivery &&
      storeSetup.data.serviceAvailability,
  );

  const storeStatus = storeSetup.data.storeStatus;

  const resolvedView = useMemo(() => {
    if (debugView !== 'auto') return debugView;
    if (!setupComplete) return 'empty' as const;
    if (storeStatus === 'closed' || storeStatus === 'temporarily-closed') return 'closed' as const;
    return 'main' as const;
  }, [debugView, setupComplete, storeStatus]);

  function handleDebugSelect(value: DebugView) {
    setDebugView(value);
    setDebugMenuOpen(false);
  }

  function comingSoon(feature: string) {
    Alert.alert(feature, 'Coming soon.');
  }

  function handleQuickAction(label: string) {
    if (label === 'Add Product') {
      navigation.navigate('AddProduct');
      return;
    }
    if (label === 'Inventory') {
      navigation.navigate('InventoryOverview');
      return;
    }
    if (label === 'Orders' || label === 'Order Pipeline') {
      navigation.navigate('OrdersList');
      return;
    }
    if (label === 'Pricing') {
      navigation.navigate('PricingOverview');
      return;
    }
    if (label === 'Offers' || label === 'Add Offer' || label === 'Festival Offers') {
      navigation.navigate('OffersOverview');
      return;
    }
    if (label === 'Payments') {
      navigation.navigate('PaymentsOverview');
      return;
    }
    if (label === 'Analytics') {
      navigation.navigate('AnalyticsOverview');
      return;
    }
    if (label === 'Store') {
      navigation.navigate('ProfileStoreInfo');
      return;
    }
    if (label === 'Help' || label === 'Contact Support') {
      navigation.navigate('HelpSupport');
      return;
    }
    if (label === 'Disputes') {
      const activeDispute = disputes.find(d => d.status === 'issue-raised') ?? disputes[0];
      if (activeDispute) {
        navigation.navigate('DisputeCustomerIssue', { disputeId: activeDispute.id });
      } else {
        Alert.alert('Disputes', 'No disputes right now.');
      }
      return;
    }
    comingSoon(label);
  }

  if (booting || storeSetup.isLoading || resolvedView === 'loading') {
    return <LoadingDashboard storeName={storeName} />;
  }

  if (resolvedView === 'network-error') {
    return (
      <NetworkErrorDashboard
        storeName={storeName}
        onTryAgain={() => setDebugView('reconnecting')}
        onWorkOffline={() => setDebugView('auto')}
        onAvatarLongPress={() => setDebugMenuOpen(true)}
      />
    );
  }

  if (resolvedView === 'reconnecting') {
    return (
      <ReconnectingDashboard
        storeName={storeName}
        onRetryNow={() => setDebugView('auto')}
        onAvatarLongPress={() => setDebugMenuOpen(true)}
      />
    );
  }

  if (resolvedView === 'suspended') {
    return (
      <SuspendedDashboard
        storeName={storeName}
        onAvatarLongPress={() => setDebugMenuOpen(true)}
      />
    );
  }

  return (
    <>
      {resolvedView === 'empty' ? (
        <EmptySetupDashboard
          storeName={storeName}
          onQuickAction={handleQuickAction}
          onAvatarLongPress={() => setDebugMenuOpen(true)}
          navigation={navigation}
        />
      ) : resolvedView === 'closed' ? (
        <ClosedDashboard
          storeName={storeName}
          temporarily={storeStatus === 'temporarily-closed'}
          onOpenNow={() => storeSetup.setStoreStatus('open')}
          onQuickAction={handleQuickAction}
          onAvatarLongPress={() => setDebugMenuOpen(true)}
        />
      ) : (
        <MainDashboard
          storeName={storeName}
          showOrders={debugView !== 'no-orders'}
          onQuickAction={handleQuickAction}
          onAvatarLongPress={() => setDebugMenuOpen(true)}
          onAvatarPress={() => navigation.navigate('Profile')}
          onNotificationsPress={() => navigation.navigate('Notifications')}
        />
      )}

      <DebugMenu
        visible={debugMenuOpen}
        current={debugView}
        onSelect={handleDebugSelect}
        onClose={() => setDebugMenuOpen(false)}
      />
    </>
  );
}

// ---------- Shared header ----------

function StatusBarSpacer() {
  return <StatusBar barStyle="dark-content" backgroundColor={colors.white} />;
}

function HeaderBar({
  storeName,
  statusLabel,
  statusColor,
  notificationCount = 0,
  onAvatarLongPress,
  onAvatarPress,
  onNotificationsPress,
  avatarBackground = colors.primarySurface,
  avatarIconColor = colors.primary,
}: {
  storeName: string;
  statusLabel: string;
  statusColor: string;
  notificationCount?: number;
  onAvatarLongPress: () => void;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
  avatarBackground?: string;
  avatarIconColor?: string;
}) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        style={[styles.avatar, { backgroundColor: avatarBackground }]}
        onPress={onAvatarPress}
        onLongPress={onAvatarLongPress}
        delayLongPress={500}
      >
        <Icon name="home" size={20} color={avatarIconColor} />
      </Pressable>
      <View style={styles.headerTextColumn}>
        <Text style={styles.headerStoreName} numberOfLines={1}>
          {storeName}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          style={styles.headerButton}
          onPress={onNotificationsPress ?? (() => Alert.alert('Notifications', 'Coming soon.'))}
        >
          <Icon name="bell" size={18} color={colors.textPrimary} />
          {notificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.headerButton} onPress={() => Alert.alert('Settings', 'Coming soon.')}>
          <Icon name="settings" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function QuickActionsRow({ onPress }: { onPress: (label: string) => void }) {
  return (
    <View style={styles.quickActionsCard}>
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map(action => (
          <Pressable key={action.label} style={styles.quickAction} onPress={() => onPress(action.label)}>
            <View style={[styles.quickActionIcon, { backgroundColor: action.background }]}>
              <Icon name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DebugMenu({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: DebugView;
  onSelect: (value: DebugView) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.debugSheetWrapper} onPress={event => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']} style={styles.debugSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.debugTitle}>Preview Dashboard State</Text>
            <Text style={styles.debugSubtitle}>For demo purposes — long-press the store icon to reopen</Text>
            <FlatList
              data={DEBUG_OPTIONS}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.debugOption} onPress={() => onSelect(item.value)}>
                  <Text style={styles.debugOptionText}>{item.label}</Text>
                  {current === item.value ? (
                    <Icon name="check" size={16} color={colors.primary} strokeWidth={3} />
                  ) : null}
                </Pressable>
              )}
            />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Loading ----------

function LoadingDashboard({ storeName }: { storeName: string }) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <View style={styles.headerRow}>
        <View style={[styles.skeletonBlock, { width: 40, height: 40, borderRadius: radii.md }]} />
        <View style={[styles.headerTextColumn, { gap: spacing.sm }]}>
          <View style={[styles.skeletonBlock, { width: 124, height: 14, borderRadius: 7 }]} />
          <View style={[styles.skeletonBlock, { width: 79, height: 11, borderRadius: 6 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: 36, height: 36, borderRadius: radii.md }]} />
        <View style={[styles.skeletonBlock, { width: 36, height: 36, borderRadius: radii.md }]} />
      </View>
      <ScrollView contentContainerStyle={styles.loadingBody}>
        <View style={[styles.skeletonBlock, styles.skeletonBanner]} />
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonBlock, styles.skeletonMetric]} />
          <View style={[styles.skeletonBlock, styles.skeletonMetric]} />
        </View>
        <View style={styles.skeletonRow}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.skeletonBlock, styles.skeletonPipeline]} />
          ))}
        </View>
        <View style={styles.loadingFooterRow}>
          <Icon name="refresh-cw" size={16} color={colors.textSecondary} />
          <Text style={styles.loadingFooterText}>Loading {storeName}'s dashboard...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Main (open, with orders) ----------

function MainDashboard({
  storeName,
  showOrders,
  onQuickAction,
  onAvatarLongPress,
  onAvatarPress,
  onNotificationsPress,
}: {
  storeName: string;
  showOrders: boolean;
  onQuickAction: (label: string) => void;
  onAvatarLongPress: () => void;
  onAvatarPress?: () => void;
  onNotificationsPress: () => void;
}) {
  const { orders: allOrders } = useOrders();
  const { unreadCount } = useNotifications();
  const { products } = useProductCatalog();
  const orders = showOrders ? allOrders : [];
  const pending = orders.filter(order => order.status === 'new').length;
  const preparing = orders.filter(order =>
    ['preparing', 'quality-check', 'packing'].includes(order.status),
  ).length;
  const ready = orders.filter(order =>
    ['ready-for-dispatch', 'dispatched'].includes(order.status),
  ).length;
  const completed = orders.filter(order => order.status === 'completed').length;

  const [todayStats, setTodayStats] = useState<OverviewResponse | null>(null);
  const [weekStats, setWeekStats] = useState<OverviewResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    Promise.all([
      api.get<OverviewResponse>('/vendor/analytics/overview', { params: { period: 'today' } }),
      api.get<OverviewResponse>('/vendor/analytics/overview', { params: { period: 'week' } }),
    ])
      .then(([today, week]) => {
        if (cancelled) return;
        setTodayStats(today.data);
        setWeekStats(week.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ordersKpi = todayStats?.kpiStats.find(k => k.key === 'orders');
  const revenueKpi = todayStats?.kpiStats.find(k => k.key === 'revenue');
  const weekRevenueKpi = weekStats?.kpiStats.find(k => k.key === 'revenue');

  const lowStockProducts = products.filter(p => p.status === 'low-stock');
  const outOfStockProducts = products.filter(p => p.status === 'out-of-stock');

  const revenueDays = weekStats
    ? buildLast7DaysSeries(weekStats.revenueDates, weekStats.revenueTrend)
    : [];
  const maxRevenueValue = Math.max(1, ...revenueDays.map(d => d.value));

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <HeaderBar
        storeName={storeName}
        statusLabel="Open · Accepting Orders"
        statusColor={colors.primary}
        notificationCount={unreadCount}
        onAvatarLongPress={onAvatarLongPress}
        onAvatarPress={onAvatarPress}
        onNotificationsPress={onNotificationsPress}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#F97316', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoIcon}>
            <Icon name="flag" size={22} color={colors.white} />
          </View>
          <View style={styles.promoTextColumn}>
            <Text style={styles.promoTitle}>Navratri Sale Festival</Text>
            <Text style={styles.promoSubtitle}>Add festive offers to attract more customers</Text>
          </View>
          <Pressable style={styles.promoButton} onPress={() => onQuickAction('Festival Offers')}>
            <Text style={styles.promoButtonText}>Setup →</Text>
          </Pressable>
        </LinearGradient>

        {showOrders ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Today's Overview</Text>
              <Text style={styles.sectionMeta}>Sun, 15 Sep</Text>
            </View>
            <View style={styles.metricsRow}>
              <MetricCard
                icon="package"
                iconColor={colors.primary}
                iconBackground={colors.primarySurface}
                value={statsLoading ? '—' : ordersKpi?.value ?? '0'}
                label="Total Orders"
                sublabel={ordersKpi?.changeLabel ?? 'Today'}
                trend={upwardTrendBadge(ordersKpi)}
              />
              <MetricCard
                icon="credit-card"
                iconColor="#059669"
                iconBackground="#D1FAE5"
                value={statsLoading ? '—' : revenueKpi?.value ?? '₹0'}
                label="Today's Sales"
                sublabel={revenueKpi?.changeLabel ?? 'Revenue'}
                trend={upwardTrendBadge(revenueKpi)}
              />
            </View>
          </View>
        ) : (
          <View style={styles.sectionBlock}>
            <View style={styles.metricsRow}>
              <MetricCard
                icon="package"
                iconColor={colors.textSecondary}
                iconBackground={colors.surface}
                value="0"
                label="Total Orders"
                sublabel="No orders today"
                muted
              />
              <MetricCard
                icon="credit-card"
                iconColor={colors.textSecondary}
                iconBackground={colors.surface}
                value="₹ 0"
                label="Today's Sales"
                sublabel="Start selling"
                muted
              />
            </View>
          </View>
        )}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Order Pipeline</Text>
            <Pressable onPress={() => onQuickAction('Order Pipeline')}>
              <Text style={styles.linkText}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.pipelineRow}>
            <PipelineTile
              icon="clock"
              value={pending}
              label="Pending"
              color={colors.warningDark}
              background={colors.warningSurface}
              iconBackground="rgba(247,144,9,0.13)"
            />
            <PipelineTile
              icon="package"
              value={preparing}
              label="Preparing"
              color="#1570EF"
              background="#EFF8FF"
              iconBackground="rgba(21,112,239,0.13)"
            />
            <PipelineTile
              icon="check"
              value={ready}
              label="Ready"
              color={colors.primary}
              background={colors.primarySurface}
              iconBackground="rgba(28,166,114,0.13)"
            />
            <PipelineTile
              icon="check-circle"
              value={completed}
              label="Completed"
              color={colors.textSecondary}
              background={colors.surface}
              iconBackground="rgba(102,112,133,0.13)"
            />
          </View>
        </View>

        <QuickActionsRow onPress={onQuickAction} />

        {showOrders && (lowStockProducts.length > 0 || outOfStockProducts.length > 0) ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Alerts</Text>
            <View style={styles.alertsList}>
              {lowStockProducts.length > 0 ? (
                <View style={[styles.alertCard, styles.alertCardWarning]}>
                  <Icon name="alert-triangle" size={18} color={colors.warningDark} />
                  <View style={styles.alertTextColumn}>
                    <Text style={styles.alertTitleWarning}>Low Stock Alert</Text>
                    <Text style={styles.alertBodyWarning}>{describeAlertProducts(lowStockProducts, 'running low')}</Text>
                  </View>
                  <Pressable onPress={() => onQuickAction('Inventory')}>
                    <Text style={styles.alertActionWarning}>View →</Text>
                  </Pressable>
                </View>
              ) : null}
              {outOfStockProducts.length > 0 ? (
                <View style={[styles.alertCard, styles.alertCardError]}>
                  <Icon name="alert-circle" size={18} color={colors.error} />
                  <View style={styles.alertTextColumn}>
                    <Text style={styles.alertTitleError}>Out of Stock</Text>
                    <Text style={styles.alertBodyError}>{describeAlertProducts(outOfStockProducts)}</Text>
                  </View>
                  <Pressable onPress={() => onQuickAction('Inventory')}>
                    <Text style={styles.alertActionError}>Fix →</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {!showOrders && (
          <View style={styles.sectionBlock}>
            <View style={styles.emptyOrdersCard}>
              <View style={styles.emptyOrdersIcon}>
                <Icon name="shopping-cart" size={36} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyOrdersTitle}>No orders today</Text>
              <Text style={styles.emptyOrdersSubtitle}>
                Your store is open and ready. Share your store link to attract customers.
              </Text>
              <View style={styles.emptyOrdersButtons}>
                <Button
                  label="Share Store"
                  icon={<Icon name="share" size={14} color={colors.white} />}
                  onPress={() => onQuickAction('Share Store')}
                />
                <Button
                  label="Add Offer"
                  variant="outline"
                  icon={<Icon name="percent" size={14} color={colors.textPrimary} />}
                  onPress={() => onQuickAction('Add Offer')}
                />
              </View>
            </View>
          </View>
        )}

        {showOrders ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Recent Orders</Text>
              <Pressable onPress={() => onQuickAction('Orders')}>
                <Text style={styles.linkText}>All Orders</Text>
              </Pressable>
            </View>
            <View style={styles.ordersCard}>
              {orders.slice(0, 4).map((order, index, list) => (
                <View
                  key={order.id}
                  style={[styles.orderRow, index < list.length - 1 && styles.orderRowDivider]}
                >
                  <View style={styles.orderIcon}>
                    <Icon name="package" size={18} color={colors.textSecondary} />
                  </View>
                  <View style={styles.orderTextColumn}>
                    <View style={styles.orderNameRow}>
                      <Text style={styles.orderCustomer}>{order.customerName}</Text>
                      <Text style={styles.orderId}>{order.id}</Text>
                    </View>
                    <Text style={styles.orderMeta}>
                      {order.itemsCount} items · {order.timeLabel}
                    </Text>
                  </View>
                  <View style={styles.orderAmountColumn}>
                    <Text style={styles.orderAmount}>₹{order.amount}</Text>
                    <Badge
                      label={ORDER_STATUS_META[order.status].label}
                      tone={
                        order.status === 'new'
                          ? 'warning'
                          : order.status === 'ready-for-dispatch' || order.status === 'dispatched'
                            ? 'success'
                            : 'neutral'
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <View>
                <Text style={styles.sectionLabel}>Weekly Revenue</Text>
                <Text style={styles.revenueValue}>{statsLoading ? '—' : weekRevenueKpi?.value ?? '₹0'}</Text>
              </View>
              {weekRevenueKpi?.direction === 'up' ? (
                <View style={styles.revenueTrendPill}>
                  <Icon name="trending-up" size={11} color={colors.primary} />
                  <Text style={styles.revenueTrendText}>{upwardTrendBadge(weekRevenueKpi)}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.revenueBarsRow}>
              {revenueDays.map(day => (
                <View
                  key={day.key}
                  style={[
                    styles.revenueBar,
                    {
                      height: Math.max(4, (day.value / maxRevenueValue) * 48),
                      backgroundColor: day.isToday ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.revenueDaysRow}>
              {revenueDays.map(day => (
                <Text key={day.key} style={styles.revenueDayLabel}>
                  {day.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Empty / setup checklist ----------

function EmptySetupDashboard({
  storeName,
  onQuickAction,
  onAvatarLongPress,
  navigation,
}: {
  storeName: string;
  onQuickAction: (label: string) => void;
  onAvatarLongPress: () => void;
  navigation: Props['navigation'];
}) {
  const storeSetup = useStoreSetup();
  const { products } = useProductCatalog();
  const checklist = [
    {
      label: 'Add your first product',
      done: products.length > 0,
      action: 'Add Now',
      onPress: () => onQuickAction('Add Product'),
    },
    {
      label: 'Set delivery settings',
      done: Boolean(storeSetup.data.delivery),
      action: 'Set Up',
      onPress: () => navigation.navigate('DeliverySettings'),
    },
    {
      label: 'Upload store logo & cover',
      done: Boolean(storeSetup.data.logoUploaded && storeSetup.data.coverImageUploaded),
      action: 'Upload',
      onPress: () => navigation.navigate('StoreLogoUpload'),
    },
    {
      label: 'Set store hours',
      done: Boolean(storeSetup.data.operatingHours),
      action: 'Set Up',
      onPress: () => navigation.navigate('OperatingHours'),
    },
    {
      label: 'Preview your store page',
      done: false,
      action: 'Preview',
      onPress: () => onQuickAction('Store Preview'),
    },
  ];
  const doneCount = checklist.filter(item => item.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <HeaderBar
        storeName={storeName}
        statusLabel="Open · Accepting Orders"
        statusColor={colors.primary}
        onAvatarLongPress={onAvatarLongPress}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <Text style={styles.welcomeGreeting}>Welcome,</Text>
          <Text style={styles.welcomeStoreName}>{storeName}</Text>
          <Text style={styles.welcomeSubtitle}>
            Complete your store setup to start receiving orders. You're almost there!
          </Text>
          <View style={styles.welcomeProgressRow}>
            <Text style={styles.welcomeProgressLabel}>Setup Progress</Text>
            <Text style={styles.welcomeProgressValue}>{progress}%</Text>
          </View>
          <View style={styles.welcomeProgressTrack}>
            <View style={[styles.welcomeProgressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <Text style={styles.sectionLabel}>Setup Checklist</Text>
            <Text style={styles.sectionMeta}>
              {doneCount} / {checklist.length} done
            </Text>
          </View>
          {checklist.map((item, index) => (
            <View
              key={item.label}
              style={[styles.checklistRow, index < checklist.length - 1 && styles.checklistRowDivider]}
            >
              <View style={[styles.checklistCircle, item.done && styles.checklistCircleDone]}>
                {item.done ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <Text style={[styles.checklistLabel, item.done && styles.checklistLabelDone]}>
                {item.label}
              </Text>
              {!item.done ? (
                <Pressable onPress={item.onPress}>
                  <Text style={styles.linkText}>{item.action} →</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.emptyOrdersCard}>
            <View style={styles.emptyOrdersIconLarge}>
              <Icon name="package" size={26} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyOrdersTitle}>No orders yet</Text>
            <Text style={styles.emptyOrdersSubtitle}>
              Add products to start receiving orders from customers
            </Text>
            <Button
              label="Add First Product"
              icon={<Icon name="plus" size={16} color={colors.white} />}
              onPress={() => onQuickAction('Add Product')}
            />
          </View>
        </View>

        <QuickActionsRow onPress={onQuickAction} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Closed / temporarily closed ----------

function ClosedDashboard({
  storeName,
  temporarily,
  onOpenNow,
  onQuickAction,
  onAvatarLongPress,
}: {
  storeName: string;
  temporarily: boolean;
  onOpenNow: () => void;
  onQuickAction: (label: string) => void;
  onAvatarLongPress: () => void;
}) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <HeaderBar
        storeName={storeName}
        statusLabel={temporarily ? 'Temporarily Closed' : 'Closed'}
        statusColor={colors.textSecondary}
        notificationCount={2}
        onAvatarLongPress={onAvatarLongPress}
        avatarBackground={colors.surface}
        avatarIconColor={colors.textSecondary}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.closedBanner}>
          <View style={styles.closedIcon}>
            <Icon name="moon" size={22} color={colors.white} />
          </View>
          <View style={styles.closedTextColumn}>
            <Text style={styles.closedTitle}>{temporarily ? 'Store is Temporarily Closed' : 'Store is Closed'}</Text>
            <Text style={styles.closedSubtitle}>
              Customers cannot place orders · Reopens 9:00 AM tomorrow
            </Text>
          </View>
          <Pressable style={styles.closedButton} onPress={onOpenNow}>
            <Text style={styles.closedButtonText}>Open Now</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Yesterday's Summary</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="package"
              iconColor={colors.primary}
              iconBackground={colors.primarySurface}
              value="31"
              label="Total Orders"
              sublabel="vs 28 prev day"
              trend="12%"
            />
            <MetricCard
              icon="credit-card"
              iconColor="#059669"
              iconBackground="#D1FAE5"
              value="₹8.6K"
              label="Revenue"
              sublabel="Settlement tmrw"
              trend="12%"
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.pipelineRow}>
            <PipelineTile
              icon="check-circle"
              value={28}
              label="Delivered"
              color={colors.primary}
              background={colors.primarySurface}
              iconBackground="rgba(28,166,114,0.13)"
            />
            <PipelineTile
              icon="x-circle"
              value={2}
              label="Cancelled"
              color={colors.error}
              background={colors.errorSurface}
              iconBackground="rgba(217,45,32,0.13)"
            />
            <PipelineTile
              icon="refresh-cw"
              value={1}
              label="Returns"
              color={colors.warningDark}
              background={colors.warningSurface}
              iconBackground="rgba(247,144,9,0.13)"
            />
            <PipelineTile
              icon="clock"
              value={28}
              label="Avg. Time"
              color={colors.textSecondary}
              background={colors.surface}
              iconBackground="rgba(102,112,133,0.13)"
            />
          </View>
        </View>

        <QuickActionsRow onPress={onQuickAction} />

        <View style={styles.sectionBlock}>
          <View style={styles.closedInfoCard}>
            <Icon name="moon" size={32} color={colors.textTertiary} />
            <Text style={styles.closedInfoTitle}>Store closes at 9:00 PM</Text>
            <Text style={styles.closedInfoSubtitle}>
              New orders will be accepted when the store reopens tomorrow at 9:00 AM
            </Text>
            <View style={styles.closedInfoButton}>
              <Text style={styles.closedInfoButtonText} onPress={onOpenNow}>
                Open Store Now
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Suspended ----------

function SuspendedDashboard({
  storeName,
  onAvatarLongPress,
}: {
  storeName: string;
  onAvatarLongPress: () => void;
}) {
  const steps = [
    'Acknowledge the suspension notice',
    'Submit your response and explanation',
    'Upload supporting documents',
    'Wait for review (1–3 business days)',
  ];
  const impact = [
    { label: 'New orders', value: 'blocked', tone: 'error' as const },
    { label: 'Store visibility', value: 'hidden', tone: 'error' as const },
    { label: 'Payments', value: 'on hold', tone: 'warning' as const },
    { label: 'Existing orders', value: 'must fulfill', tone: 'warning' as const },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <HeaderBar
        storeName={storeName}
        statusLabel="Suspended"
        statusColor={colors.error}
        onAvatarLongPress={onAvatarLongPress}
        avatarBackground={colors.errorSurface}
        avatarIconColor={colors.error}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.suspendedBanner}>
          <View style={styles.suspendedHeaderRow}>
            <Icon name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.suspendedTitle}>Store Suspended</Text>
          </View>
          <Text style={styles.suspendedBody}>
            Your store has been temporarily suspended due to a policy violation. Customers cannot
            view or order from your store.
          </Text>
          <View style={styles.suspendedReasonBox}>
            <Text style={styles.suspendedReasonTitle}>Suspension Reason</Text>
            <Text style={styles.suspendedReasonBody}>
              Multiple customer complaints about product quality and incorrect item delivery (Case
              #CMP-9847)
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Impact</Text>
            {impact.map((item, index) => (
              <View
                key={item.label}
                style={[styles.impactRow, index < impact.length - 1 && styles.impactRowDivider]}
              >
                <Text style={styles.impactLabel}>{item.label}</Text>
                <Badge label={item.value.toUpperCase()} tone={item.tone} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Resolution Steps</Text>
            {steps.map((step, index) => (
              <View key={step} style={styles.resolutionRow}>
                <View style={styles.resolutionBadge}>
                  <Text style={styles.resolutionBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.resolutionText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Button
            label="Respond to Suspension"
            onPress={() => Alert.alert('Respond to Suspension', 'Coming soon.')}
          />
          <View style={styles.spacer12} />
          <Button
            label="Contact Support"
            variant="outline"
            onPress={() => Alert.alert('Contact Support', 'Coming soon.')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Network error ----------

function NetworkErrorDashboard({
  storeName,
  onTryAgain,
  onWorkOffline,
  onAvatarLongPress,
}: {
  storeName: string;
  onTryAgain: () => void;
  onWorkOffline: () => void;
  onAvatarLongPress: () => void;
}) {
  return (
    <View style={styles.darkRoot}>
      <SafeAreaView edges={['top']} style={styles.darkTop}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        <View style={styles.statusBarSpacerDark} />
        <View style={styles.offlinePill}>
          <Icon name="wifi-off" size={13} color={colors.error} />
          <Text style={styles.offlinePillText}>No Internet Connection</Text>
        </View>
      </SafeAreaView>
      <Pressable style={styles.darkHeaderRow} onLongPress={onAvatarLongPress} delayLongPress={500}>
        <View style={styles.darkAvatar}>
          <Icon name="home" size={20} color="rgba(255,255,255,0.6)" />
        </View>
        <View style={styles.headerTextColumn}>
          <Text style={styles.darkStoreName}>{storeName}</Text>
          <Text style={styles.darkStoreSubtitle}>Status unavailable</Text>
        </View>
        <Icon name="bell" size={18} color="rgba(255,255,255,0.6)" />
      </Pressable>

      <SafeAreaView edges={['bottom']} style={styles.errorBody}>
        <View style={styles.errorIconWrapper}>
          <View style={styles.errorIconRingOuter} />
          <View style={styles.errorIconRingInner} />
          <View style={styles.errorIconCircle}>
            <Icon name="wifi-off" size={44} color={colors.error} />
          </View>
        </View>
        <Text style={styles.errorTitle}>No Internet Connection</Text>
        <Text style={styles.errorSubtitle}>
          Dashboard data couldn't be loaded. Check your connection and try again.
        </Text>
        <View style={styles.lastSyncedPill}>
          <Text style={styles.lastSyncedText}>
            Last synced: <Text style={styles.lastSyncedValue}>Today, 2:14 PM</Text>
          </Text>
        </View>
        <View style={styles.staleWarning}>
          <Icon name="alert-triangle" size={14} color={colors.warningDark} />
          <Text style={styles.staleWarningText}>
            Some information may be outdated. Data will refresh when connection is restored.
          </Text>
        </View>
        <View style={styles.errorButtons}>
          <Button
            label="Try Again"
            icon={<Icon name="refresh-cw" size={18} color={colors.white} />}
            onPress={onTryAgain}
          />
          <View style={styles.spacer12} />
          <Button label="Work Offline" variant="outline" onPress={onWorkOffline} />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ---------- Reconnecting ----------

function ReconnectingDashboard({
  storeName,
  onRetryNow,
  onAvatarLongPress,
}: {
  storeName: string;
  onRetryNow: () => void;
  onAvatarLongPress: () => void;
}) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      <View style={styles.reconnectingStrip}>
        <Icon name="refresh-cw" size={14} color={colors.white} />
        <Text style={styles.reconnectingStripText}>Reconnecting to server...</Text>
      </View>
      <HeaderBar
        storeName={storeName}
        statusLabel="Open · Accepting Orders"
        statusColor={colors.primary}
        notificationCount={3}
        onAvatarLongPress={onAvatarLongPress}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.reconnectCard}>
          <View style={styles.suspendedHeaderRow}>
            <Icon name="refresh-cw" size={16} color={colors.warningDark} />
            <Text style={styles.reconnectTitle}>Reconnecting · Attempt 3 of 5</Text>
          </View>
          <View style={styles.reconnectProgressTrack}>
            <View style={styles.reconnectProgressFill} />
          </View>
          <Text style={styles.reconnectSubtitle}>
            Dashboard may show stale data. Retrying in 5 seconds...
          </Text>
        </View>

        <View style={styles.cachedNotice}>
          <Icon name="info" size={13} color={colors.textSecondary} />
          <Text style={styles.cachedNoticeText}>
            Showing cached data from <Text style={styles.cachedNoticeBold}>2:14 PM</Text> · Live data
            updating
          </Text>
        </View>

        <View style={[styles.sectionBlock, styles.dimmed]}>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="package"
              iconColor={colors.primary}
              iconBackground={colors.primarySurface}
              value="47"
              label="Total Orders"
              sublabel="Cached data"
            />
            <MetricCard
              icon="credit-card"
              iconColor="#059669"
              iconBackground="#D1FAE5"
              value="₹12.4K"
              label="Today's Sales"
              sublabel="Cached data"
            />
          </View>
        </View>

        <View style={[styles.sectionBlock, styles.dimmedMore]}>
          <View style={styles.pipelineRow}>
            <PipelineTile
              icon="clock"
              value={8}
              label="Pending"
              color={colors.warningDark}
              background={colors.warningSurface}
              iconBackground="rgba(247,144,9,0.13)"
            />
            <PipelineTile
              icon="package"
              value={5}
              label="Preparing"
              color="#1570EF"
              background="#EFF8FF"
              iconBackground="rgba(21,112,239,0.13)"
            />
            <PipelineTile
              icon="check"
              value={3}
              label="Ready"
              color={colors.primary}
              background={colors.primarySurface}
              iconBackground="rgba(28,166,114,0.13)"
            />
            <PipelineTile
              icon="check-circle"
              value={31}
              label="Completed"
              color={colors.textSecondary}
              background={colors.surface}
              iconBackground="rgba(102,112,133,0.13)"
            />
          </View>
        </View>

        <QuickActionsRow onPress={() => undefined} />

        <View style={styles.sectionBlock}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Connection Details</Text>
            <ConnectionRow label="Internet" value="Connected (4G)" tone="success" />
            <ConnectionRow label="Server status" value="Degraded" tone="error" />
            <ConnectionRow label="Last successful sync" value="2:14 PM today" tone="success" />
            <ConnectionRow label="Error code" value="ERR_SERVER_TIMEOUT" tone="error" mono last />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Button
            label="Retry Now"
            icon={<Icon name="refresh-cw" size={18} color={colors.white} />}
            onPress={onRetryNow}
          />
          <View style={styles.spacer12} />
          <Button
            label="Check Server Status"
            variant="outline"
            onPress={() => Alert.alert('Server Status', 'All systems checked.')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConnectionRow({
  label,
  value,
  tone,
  mono = false,
  last = false,
}: {
  label: string;
  value: string;
  tone: 'success' | 'error';
  mono?: boolean;
  last?: boolean;
}) {
  const color = tone === 'success' ? colors.primary : colors.error;
  return (
    <View style={[styles.connectionRow, !last && styles.connectionRowDivider]}>
      <Text style={styles.connectionLabel}>{label}</Text>
      <View style={styles.connectionValueRow}>
        <View style={[styles.connectionDot, { backgroundColor: color }]} />
        <Text style={[styles.connectionValue, { color: tone === 'success' ? colors.textPrimary : color }, mono && styles.connectionValueMono]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    paddingBottom: spacing.huge,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 2,
  },
  headerStoreName: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  statusLabel: {
    ...typography.tinyBold,
    fontFamily: fontFamilies.semibold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    ...typography.tinyBold,
    fontSize: 9,
    color: colors.white,
  },
  sectionBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  sectionMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  linkText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  promoBanner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    overflow: 'hidden',
  },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTextColumn: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    ...typography.bodySemibold,
    color: colors.white,
  },
  promoSubtitle: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.85)',
  },
  promoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  promoButtonText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  pipelineRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionsCard: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...typography.tiny,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  alertsList: {
    gap: spacing.md,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  alertCardWarning: {
    backgroundColor: colors.warningSurface,
    borderColor: '#FCD34D',
  },
  alertCardError: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.errorBorder,
  },
  alertTextColumn: {
    flex: 1,
    gap: 1,
  },
  alertTitleWarning: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  alertBodyWarning: {
    ...typography.caption,
    color: '#A16207',
  },
  alertActionWarning: {
    ...typography.caption,
    fontFamily: fontFamilies.semibold,
    color: colors.warningDark,
  },
  alertTitleError: {
    ...typography.labelSemibold,
    color: colors.errorDark,
  },
  alertBodyError: {
    ...typography.caption,
    color: colors.error,
  },
  alertActionError: {
    ...typography.caption,
    fontFamily: fontFamilies.semibold,
    color: colors.error,
  },
  emptyOrdersCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    gap: spacing.xs,
  },
  emptyOrdersIcon: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyOrdersIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyOrdersTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  emptyOrdersSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
  emptyOrdersButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
    width: '100%',
  },
  ordersCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  orderRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTextColumn: {
    flex: 1,
    gap: 2,
  },
  orderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderCustomer: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  orderId: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.textSecondary,
  },
  orderMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  orderAmountColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderAmount: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  revenueCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  revenueValue: {
    ...typography.h2,
    fontSize: 20,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  revenueTrendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  revenueTrendText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  revenueBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 62,
    paddingTop: spacing.lg,
  },
  revenueBar: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  revenueDaysRow: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },
  revenueDayLabel: {
    flex: 1,
    ...typography.tiny,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  welcomeBanner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    overflow: 'hidden',
  },
  welcomeGreeting: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  welcomeStoreName: {
    ...typography.h2,
    fontSize: 20,
    color: colors.white,
    paddingTop: 2,
  },
  welcomeSubtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: 'rgba(255,255,255,0.8)',
    paddingTop: spacing.sm,
  },
  welcomeProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
  },
  welcomeProgressLabel: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.7)',
  },
  welcomeProgressValue: {
    ...typography.captionBold,
    color: colors.white,
  },
  welcomeProgressTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  welcomeProgressFill: {
    height: 6,
    backgroundColor: colors.white,
    borderRadius: 3,
  },
  checklistCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  checklistRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checklistCircle: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checklistLabel: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  checklistLabelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  closedIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedTextColumn: {
    flex: 1,
    gap: 2,
  },
  closedTitle: {
    ...typography.bodySemibold,
    color: colors.white,
  },
  closedSubtitle: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.6)',
  },
  closedButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closedButtonText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  closedInfoCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.xs,
  },
  closedInfoTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingTop: spacing.md,
  },
  closedInfoSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
  closedInfoButton: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  closedInfoButtonText: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  suspendedBanner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.errorSurface,
    borderWidth: 2,
    borderColor: colors.error,
    gap: spacing.md,
  },
  suspendedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  suspendedTitle: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    fontSize: 15,
    color: colors.error,
  },
  suspendedBody: {
    ...typography.body,
    color: colors.errorDark,
  },
  suspendedReasonBox: {
    backgroundColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 4,
  },
  suspendedReasonTitle: {
    ...typography.captionBold,
    color: colors.error,
  },
  suspendedReasonBody: {
    ...typography.caption,
    color: colors.errorDark,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  impactRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  impactLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  resolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resolutionBadge: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolutionBadgeText: {
    ...typography.tinyBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  resolutionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  spacer12: {
    height: spacing.lg,
  },
  darkRoot: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  darkTop: {
    backgroundColor: '#1F2937',
  },
  statusBarSpacerDark: {
    height: 0,
  },
  offlinePill: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 9999,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  offlinePillText: {
    ...typography.tinyBold,
    color: colors.error,
  },
  darkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#374151',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
    opacity: 0.9,
  },
  darkAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkStoreName: {
    ...typography.bodySemibold,
    color: 'rgba(255,255,255,0.8)',
  },
  darkStoreSubtitle: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.4)',
  },
  errorBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  errorIconWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  errorIconRingOuter: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(217,45,32,0.08)',
  },
  errorIconRingInner: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: 'rgba(217,45,32,0.15)',
  },
  errorIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  lastSyncedPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.xxl,
  },
  lastSyncedText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastSyncedValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  staleWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
    maxWidth: 350,
  },
  staleWarningText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  errorButtons: {
    width: '100%',
    maxWidth: 350,
    marginTop: spacing.xxl,
  },
  reconnectingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
  },
  reconnectingStripText: {
    ...typography.captionBold,
    color: colors.white,
  },
  reconnectCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.warningSurface,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    gap: spacing.md,
  },
  reconnectTitle: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  reconnectProgressTrack: {
    height: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(251,191,36,0.3)',
    overflow: 'hidden',
  },
  reconnectProgressFill: {
    height: 4,
    width: '60%',
    backgroundColor: colors.warningDark,
    borderRadius: 2,
  },
  reconnectSubtitle: {
    ...typography.caption,
    color: '#A16207',
  },
  cachedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cachedNoticeText: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
  },
  cachedNoticeBold: {
    fontFamily: fontFamilies.semibold,
  },
  dimmed: {
    opacity: 0.6,
  },
  dimmedMore: {
    opacity: 0.5,
  },
  connectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  connectionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  connectionLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  connectionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  connectionValue: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.medium,
  },
  connectionValueMono: {
    fontFamily: 'Courier',
  },
  skeletonBlock: {
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  loadingBody: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  skeletonBanner: {
    height: 72,
    borderRadius: radii.xl,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  skeletonMetric: {
    flex: 1,
    height: 88,
    borderRadius: radii.xl,
  },
  skeletonPipeline: {
    flex: 1,
    height: 80,
    borderRadius: radii.md,
  },
  loadingFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  loadingFooterText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  debugSheetWrapper: {
    width: '100%',
  },
  debugSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  debugTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  debugSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: 2,
    paddingBottom: spacing.md,
  },
  debugOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  debugOptionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
