import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, MetricCard, PipelineTile } from '../../components';
import type { BadgeTone } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { ORDER_STATUS_META, useOrders } from '../../context/OrdersContext';
import type { Order, OrderStatus } from '../../context/OrdersContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { resolveVendorEntryRoute } from '../../utils/vendorRouting';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'Dashboard'>;

type SimpleRoute = {
  [K in keyof AuthStackParamList]: undefined extends AuthStackParamList[K] ? K : never;
}[keyof AuthStackParamList];

type QuickAction = { icon: IconName; label: string; background: string; color: string; route: SimpleRoute };

const QUICK_ACTIONS: QuickAction[] = [
  { icon: 'plus', label: 'Add Product', background: colors.primarySurface, color: colors.primary, route: 'AddProduct' },
  { icon: 'package', label: 'Orders', background: '#EFF8FF', color: '#1570EF', route: 'OrdersList' },
  { icon: 'grid', label: 'Inventory', background: '#F5F3FF', color: '#7C3AED', route: 'InventoryOverview' },
  { icon: 'home', label: 'Store', background: colors.warningSurface, color: colors.warningDark, route: 'ProfileStoreInfo' },
  { icon: 'tag', label: 'Pricing', background: '#FCE7F3', color: '#DB2777', route: 'PricingOverview' },
  { icon: 'percent', label: 'Offers', background: '#FFEDD5', color: '#EA580C', route: 'OffersOverview' },
  { icon: 'credit-card', label: 'Payments', background: '#D1FAE5', color: '#059669', route: 'PaymentsOverview' },
  { icon: 'trending-up', label: 'Analytics', background: '#E0F2FE', color: '#0284C7', route: 'AnalyticsOverview' },
  { icon: 'phone', label: 'Help', background: '#EFF8FF', color: '#1570EF', route: 'HelpSupport' },
];

type PipelineStage = {
  label: string;
  statuses: OrderStatus[];
  route: SimpleRoute;
  icon: IconName;
  color: string;
  background: string;
  iconBackground: string;
};

const PIPELINE_STAGES: PipelineStage[] = [
  {
    label: 'New',
    statuses: ['placed'],
    route: 'NewOrders',
    icon: 'clock',
    color: colors.warningDark,
    background: colors.warningSurface,
    iconBackground: 'rgba(247,144,9,0.13)',
  },
  {
    label: 'Preparing',
    statuses: ['accepted', 'preparing'],
    route: 'PreparingOrders',
    icon: 'package',
    color: '#1570EF',
    background: '#EFF8FF',
    iconBackground: 'rgba(21,112,239,0.13)',
  },
  {
    label: 'Ready',
    statuses: ['ready_for_pickup'],
    route: 'ReadyForDispatchOrders',
    icon: 'check',
    color: colors.primary,
    background: colors.primarySurface,
    iconBackground: 'rgba(28,166,114,0.13)',
  },
  {
    label: 'Out for delivery',
    statuses: ['out_for_delivery'],
    route: 'DispatchedOrders',
    icon: 'truck',
    color: '#7C3AED',
    background: '#F5F3FF',
    iconBackground: 'rgba(124,58,237,0.13)',
  },
  {
    label: 'Completed',
    statuses: ['delivered'],
    route: 'CompletedOrders',
    icon: 'check-circle',
    color: colors.textSecondary,
    background: colors.surface,
    iconBackground: 'rgba(102,112,133,0.13)',
  },
  {
    label: 'Cancelled',
    statuses: ['cancelled', 'rejected'],
    route: 'CancelledOrders',
    icon: 'x-circle',
    color: colors.error,
    background: colors.errorSurface,
    iconBackground: 'rgba(217,45,32,0.13)',
  },
];

const PIPELINE_ROWS = [PIPELINE_STAGES.slice(0, 3), PIPELINE_STAGES.slice(3)];

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

const ORDER_BADGE_TONE: Record<OrderStatus, BadgeTone> = {
  placed: 'warning',
  accepted: 'info',
  preparing: 'info',
  ready_for_pickup: 'success',
  out_for_delivery: 'success',
  delivered: 'neutral',
  cancelled: 'error',
  rejected: 'error',
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isToday(iso: string | undefined) {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatRupees(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
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

export function DashboardScreen({ navigation }: Props) {
  const storeSetup = useStoreSetup();
  const refreshStoreSetup = storeSetup.refresh;
  const { orders, loading: ordersLoading, error: ordersError, refreshOrders, ordersByStatus } = useOrders();
  const { products, loading: productsLoading, error: productsError, refreshProducts } = useProductCatalog();
  const { unreadCount, refresh: refreshNotifications } = useNotifications();
  const { vendor } = useVendorAuth();
  const suspended = vendor?.status === 'suspended';

  const [weekStats, setWeekStats] = useState<OverviewResponse | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [opening, setOpening] = useState(false);

  const loadWeekStats = useCallback(async () => {
    try {
      const { data } = await api.get<OverviewResponse>('/vendor/analytics/overview', { params: { period: 'week' } });
      setWeekStats(data);
    } catch {
      // The weekly chart is supplementary — it degrades to "—" rather than blocking the dashboard.
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRetrying(true);
    const results = await Promise.allSettled([refreshOrders(), refreshProducts()]);
    const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    setRefreshError(failed ? getApiErrorMessage(failed.reason) : null);
    setRetrying(false);
    await Promise.all([refreshStoreSetup(), loadWeekStats(), refreshNotifications().catch(() => {})]);
  }, [refreshOrders, refreshProducts, refreshStoreSetup, loadWeekStats, refreshNotifications]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll]),
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

  const storeName = storeSetup.data.profile?.storeName ?? 'Your Store';
  const setupComplete = Boolean(storeSetup.data.setupCompletedAt);
  const storeStatus = storeSetup.data.storeStatus;
  const tempClosure = storeSetup.data.tempClosure;

  const setupStepsDone = [
    storeSetup.data.profile,
    storeSetup.data.logoUploaded && storeSetup.data.coverImageUploaded,
    storeSetup.data.address,
    storeSetup.data.operatingHours,
    storeSetup.data.delivery,
    storeSetup.data.serviceAvailability,
    setupComplete,
  ].filter(Boolean).length;

  const hasUnread = unreadCount > 0;
  const loadError = ordersError ?? productsError ?? refreshError;
  const initialLoading = storeSetup.isLoading || ordersLoading || productsLoading;

  const todaysOrders = useMemo(() => orders.filter(order => isToday(order.placedAt)), [orders]);
  const todaysRevenue = useMemo(
    () =>
      orders
        .filter(order => order.status === 'delivered' && isToday(order.deliveredAt ?? order.placedAt))
        .reduce((sum, order) => sum + order.amount, 0),
    [orders],
  );
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 4),
    [orders],
  );

  const lowStockProducts = products.filter(p => p.status === 'low-stock');
  const outOfStockProducts = products.filter(p => p.status === 'out-of-stock');

  const weekRevenueKpi = weekStats?.kpiStats.find(k => k.key === 'revenue');
  const revenueDays = weekStats ? buildLast7DaysSeries(weekStats.revenueDates, weekStats.revenueTrend) : [];
  const maxRevenueValue = Math.max(1, ...revenueDays.map(d => d.value));

  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  function goAddProduct() {
    if (!setupComplete) {
      Alert.alert(
        'Complete store setup first',
        'Your store setup must be completed before you can add products.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Set up store', onPress: () => navigation.navigate('StoreSetupIntro') },
        ],
      );
      return;
    }
    navigation.navigate('AddProduct');
  }

  // TS can't resolve navigate() overloads for a union of param-less route names.
  const goTo = (route: SimpleRoute) => (navigation.navigate as (screen: SimpleRoute) => void)(route);

  function handleQuickAction(route: SimpleRoute) {
    if (route === 'AddProduct') {
      goAddProduct();
      return;
    }
    goTo(route);
  }

  async function handleOpenNow() {
    setOpening(true);
    try {
      await api.patch('/vendor/store-setup/status', { storeStatus: 'open' });
      storeSetup.setStoreStatus('open');
      await refreshStoreSetup();
    } catch (err) {
      Alert.alert('Could not open store', getApiErrorMessage(err));
    } finally {
      setOpening(false);
    }
  }

  const checklist = [
    {
      label: 'Complete store setup',
      detail: `${setupStepsDone} / 7 steps done`,
      done: setupComplete,
      action: 'Continue',
      onPress: () => navigation.navigate('StoreSetupIntro'),
    },
    {
      label: 'Add your first product',
      detail: undefined,
      done: products.length > 0,
      action: 'Add Now',
      onPress: goAddProduct,
    },
  ];
  const checklistDone = checklist.filter(item => item.done).length;
  const setupProgress = Math.round((checklistDone / checklist.length) * 100);

  const headerStatus = suspended
    ? { label: 'Suspended', color: colors.error }
    : !setupComplete
    ? { label: 'Setup incomplete', color: colors.textSecondary }
    : storeStatus === 'open'
      ? { label: 'Open · Accepting Orders', color: colors.primary }
      : storeStatus === 'temporarily-closed'
        ? { label: 'Temporarily Closed', color: colors.warningDark }
        : { label: 'Closed', color: colors.textSecondary };

  const header = (
    <HeaderBar
      storeName={storeName}
      statusLabel={headerStatus.label}
      statusColor={headerStatus.color}
      hasUnread={hasUnread}
      onAvatarPress={() => navigation.navigate('Profile')}
      onNotificationsPress={() => navigation.navigate('Notifications')}
      onSettingsPress={() => navigation.navigate('Profile')}
    />
  );

  if (initialLoading) {
    return <LoadingDashboard storeName={storeName} />;
  }

  if (loadError && orders.length === 0 && products.length === 0) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBarSpacer />
        {header}
        <View style={styles.errorBody}>
          <View style={styles.errorIconCircle}>
            <Icon name="wifi-off" size={44} color={colors.error} />
          </View>
          <Text style={styles.errorTitle}>Couldn't load your dashboard</Text>
          <Text style={styles.errorSubtitle}>{loadError}</Text>
          <View style={styles.errorButtons}>
            <Button
              label="Retry"
              loading={retrying}
              icon={<Icon name="refresh-cw" size={18} color={colors.white} />}
              onPress={refreshAll}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const reopenLabel = [tempClosure?.toDate, tempClosure?.reopenAt].filter(Boolean).join(' at ');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBarSpacer />
      {header}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loadError ? (
          <View style={styles.errorStrip}>
            <Icon name="alert-triangle" size={14} color={colors.warningDark} />
            <Text style={styles.errorStripText} numberOfLines={2}>
              Some data may be out of date · {loadError}
            </Text>
            <Pressable onPress={refreshAll} disabled={retrying}>
              <Text style={styles.errorStripAction}>{retrying ? 'Retrying…' : 'Retry'}</Text>
            </Pressable>
          </View>
        ) : null}

        {suspended ? (
          <View style={styles.errorStrip}>
            <Icon name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorStripText}>
              Your account is suspended. Contact support to restore access.
            </Text>
            <Pressable onPress={() => navigation.navigate('HelpSupport')}>
              <Text style={styles.errorStripAction}>Help</Text>
            </Pressable>
          </View>
        ) : null}

        {!setupComplete ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeBanner}
          >
            <Text style={styles.welcomeGreeting}>Welcome,</Text>
            <Text style={styles.welcomeStoreName}>{storeName}</Text>
            <Text style={styles.welcomeSubtitle}>Complete your store setup to start receiving orders.</Text>
            <View style={styles.welcomeProgressRow}>
              <Text style={styles.welcomeProgressLabel}>Setup Progress</Text>
              <Text style={styles.welcomeProgressValue}>{setupProgress}%</Text>
            </View>
            <View style={styles.welcomeProgressTrack}>
              <View style={[styles.welcomeProgressFill, { width: `${setupProgress}%` }]} />
            </View>
          </LinearGradient>
        ) : storeStatus !== 'open' && !suspended ? (
          <View style={styles.closedBanner}>
            <View style={styles.closedIcon}>
              <Icon name="moon" size={22} color={colors.white} />
            </View>
            <View style={styles.closedTextColumn}>
              <Text style={styles.closedTitle}>
                {storeStatus === 'temporarily-closed' ? 'Store is Temporarily Closed' : 'Store is Closed'}
              </Text>
              <Text style={styles.closedSubtitle}>
                {reopenLabel
                  ? `Customers cannot place orders · Reopens ${reopenLabel}`
                  : 'Customers cannot place orders until you reopen'}
              </Text>
            </View>
            <Pressable style={[styles.closedButton, opening && styles.closedButtonDisabled]} onPress={handleOpenNow} disabled={opening}>
              <Text style={styles.closedButtonText}>{opening ? 'Opening…' : 'Open Now'}</Text>
            </Pressable>
          </View>
        ) : null}

        {checklistDone < checklist.length ? (
          <View style={styles.checklistCard}>
            <View style={styles.checklistHeader}>
              <Text style={styles.sectionLabel}>Setup Checklist</Text>
              <Text style={styles.sectionMeta}>
                {checklistDone} / {checklist.length} done
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
                <View style={styles.checklistTextColumn}>
                  <Text style={[styles.checklistLabel, item.done && styles.checklistLabelDone]}>{item.label}</Text>
                  {item.detail && !item.done ? <Text style={styles.checklistDetail}>{item.detail}</Text> : null}
                </View>
                {!item.done ? (
                  <Pressable onPress={item.onPress}>
                    <Text style={styles.linkText}>{item.action} →</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Today's Overview</Text>
            <Text style={styles.sectionMeta}>{todayLabel}</Text>
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="package"
              iconColor={colors.primary}
              iconBackground={colors.primarySurface}
              value={String(todaysOrders.length)}
              label="Orders Today"
              sublabel={todaysOrders.length === 0 ? 'No orders placed today' : 'Placed today'}
              muted={todaysOrders.length === 0}
              onPress={() => navigation.navigate('OrdersList')}
            />
            <MetricCard
              icon="credit-card"
              iconColor="#059669"
              iconBackground="#D1FAE5"
              value={formatRupees(todaysRevenue)}
              label="Today's Sales"
              sublabel="From orders delivered today"
              muted={todaysRevenue === 0}
              onPress={() => navigation.navigate('CompletedOrders')}
            />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Order Pipeline</Text>
            <Pressable onPress={() => navigation.navigate('OrdersList')}>
              <Text style={styles.linkText}>View All</Text>
            </Pressable>
          </View>
          {PIPELINE_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.pipelineRow}>
              {row.map(stage => (
                <PipelineTile
                  key={stage.label}
                  icon={stage.icon}
                  value={ordersByStatus(stage.statuses).length}
                  label={stage.label}
                  color={stage.color}
                  background={stage.background}
                  iconBackground={stage.iconBackground}
                  onPress={() => goTo(stage.route)}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map(action => (
              <Pressable key={action.label} style={styles.quickAction} onPress={() => handleQuickAction(action.route)}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.background }]}>
                  <Icon name={action.icon} size={20} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {lowStockProducts.length > 0 || outOfStockProducts.length > 0 ? (
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
                  <Pressable onPress={() => navigation.navigate('LowStock')}>
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
                  <Pressable onPress={() => navigation.navigate('OutOfStock')}>
                    <Text style={styles.alertActionError}>Fix →</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Recent Orders</Text>
            {orders.length > 0 ? (
              <Pressable onPress={() => navigation.navigate('OrdersList')}>
                <Text style={styles.linkText}>All Orders</Text>
              </Pressable>
            ) : null}
          </View>
          {recentOrders.length > 0 ? (
            <View style={styles.ordersCard}>
              {recentOrders.map((order, index, list) => (
                <RecentOrderRow
                  key={order.id}
                  order={order}
                  last={index === list.length - 1}
                  onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyOrdersCard}>
              <View style={styles.emptyOrdersIcon}>
                <Icon name="shopping-cart" size={28} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyOrdersTitle}>No orders yet</Text>
              <Text style={styles.emptyOrdersSubtitle}>
                {products.length === 0
                  ? 'Add products to start receiving orders from customers.'
                  : 'New orders will appear here as customers place them.'}
              </Text>
              {products.length === 0 ? (
                <Button
                  label="Add First Product"
                  icon={<Icon name="plus" size={16} color={colors.white} />}
                  onPress={goAddProduct}
                />
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <View>
                <Text style={styles.sectionLabel}>Weekly Revenue</Text>
                <Text style={styles.revenueValue}>{weekRevenueKpi?.value ?? '—'}</Text>
              </View>
              {weekRevenueKpi ? <Text style={styles.revenueChange}>{weekRevenueKpi.changeLabel}</Text> : null}
            </View>
            {revenueDays.length > 0 ? (
              <>
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
              </>
            ) : (
              <Text style={styles.revenueUnavailable}>Revenue trend is unavailable right now.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBarSpacer() {
  return <StatusBar barStyle="dark-content" backgroundColor={colors.white} />;
}

function HeaderBar({
  storeName,
  statusLabel,
  statusColor,
  hasUnread,
  onAvatarPress,
  onNotificationsPress,
  onSettingsPress,
}: {
  storeName: string;
  statusLabel: string;
  statusColor: string;
  hasUnread: boolean;
  onAvatarPress: () => void;
  onNotificationsPress: () => void;
  onSettingsPress: () => void;
}) {
  return (
    <View style={styles.headerRow}>
      <Pressable style={styles.avatar} onPress={onAvatarPress}>
        <Icon name="home" size={20} color={colors.primary} />
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
        <Pressable style={styles.headerButton} onPress={onNotificationsPress}>
          <Icon name="bell" size={18} color={colors.textPrimary} />
          {hasUnread ? <View style={styles.notificationDot} /> : null}
        </Pressable>
        <Pressable style={styles.headerButton} onPress={onSettingsPress}>
          <Icon name="settings" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function RecentOrderRow({ order, last, onPress }: { order: Order; last: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.orderRow, !last && styles.orderRowDivider]} onPress={onPress}>
      <ProductThumb
        imageUrl={order.products[0]?.imageUrl}
        style={styles.orderIcon}
        iconSize={18}
        iconColor={colors.textSecondary}
      />
      <View style={styles.orderTextColumn}>
        <View style={styles.orderNameRow}>
          <Text style={styles.orderCustomer} numberOfLines={1}>
            {order.customerName}
          </Text>
          <Text style={styles.orderId}>{order.orderNumber}</Text>
        </View>
        <Text style={styles.orderMeta}>
          {order.itemsCount} item{order.itemsCount === 1 ? '' : 's'} · {order.timeLabel}
        </Text>
      </View>
      <View style={styles.orderAmountColumn}>
        <Text style={styles.orderAmount}>{formatRupees(order.amount)}</Text>
        <Badge label={ORDER_STATUS_META[order.status].label} tone={ORDER_BADGE_TONE[order.status]} />
      </View>
    </Pressable>
  );
}

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
          {[0, 1, 2].map(index => (
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
    backgroundColor: colors.primarySurface,
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
  notificationDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  errorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  errorStripText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  errorStripAction: {
    ...typography.captionBold,
    color: colors.warningDark,
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
    width: 64,
    height: 64,
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
    flexShrink: 1,
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
    gap: spacing.md,
  },
  revenueValue: {
    ...typography.h2,
    fontSize: 20,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  revenueChange: {
    ...typography.tiny,
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
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
  revenueUnavailable: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.lg,
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
  checklistTextColumn: {
    flex: 1,
    gap: 2,
  },
  checklistLabel: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  checklistLabelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  checklistDetail: {
    ...typography.tiny,
    color: colors.textSecondary,
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
  closedButtonDisabled: {
    opacity: 0.6,
  },
  closedButtonText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  errorBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  errorIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
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
  errorButtons: {
    width: '100%',
    maxWidth: 350,
    marginTop: spacing.xxl,
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
});
