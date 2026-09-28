import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../icons/Icon';
import { InfoBanner, OrderRow, BannerVariant } from '../../components';
import { Order, useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  title: string;
  onBack: () => void;
  pill?: { label: string; color: string; background: string };
  rightLink?: { label: string; onPress: () => void };
  banner?: { variant: BannerVariant; message: string };
  orders: Order[];
  emptyMessage?: string;
  onOrderPress: (orderId: string) => void;
  renderOrderExtra?: (order: Order) => React.ReactNode;
  beforeOrders?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function OrderActionLayout({
  title,
  onBack,
  pill,
  rightLink,
  banner,
  orders,
  emptyMessage = 'No orders here',
  onOrderPress,
  renderOrderExtra,
  beforeOrders,
  children,
  footer,
}: Props) {
  const { refreshOrders, loading, error } = useOrders();
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
      // error is surfaced through context state
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {pill ? (
          <View style={[styles.pill, { backgroundColor: pill.background }]}>
            <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
          </View>
        ) : null}
        {rightLink ? (
          <Pressable onPress={rightLink.onPress} hitSlop={8}>
            <Text style={styles.rightLink}>{rightLink.label}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {banner ? (
          <View style={styles.bannerWrapper}>
            <InfoBanner variant={banner.variant} message={banner.message} />
          </View>
        ) : null}

        {error && orders.length === 0 ? (
          <View style={styles.bannerWrapper}>
            <InfoBanner variant="error" message={error} />
          </View>
        ) : null}

        {beforeOrders}

        <View style={styles.ordersCard}>
          {orders.map(order => (
            <View key={order.id}>
              <OrderRow order={order} onPress={() => onOrderPress(order.id)} />
              {renderOrderExtra ? renderOrderExtra(order) : null}
            </View>
          ))}
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            {loading && !refreshing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Icon name="package" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </>
            )}
          </View>
        ) : null}

        {children}
      </ScrollView>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
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
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    flex: 1,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  pillText: {
    ...typography.tinyBold,
  },
  rightLink: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  bannerWrapper: {
    padding: spacing.xl,
    paddingBottom: 0,
  },
  ordersCard: {
    marginTop: spacing.xl,
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
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
