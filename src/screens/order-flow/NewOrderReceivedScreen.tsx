import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InfoBanner } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewOrderReceived'>;

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function NewOrderReceivedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  const [secondsLeft, setSecondsLeft] = useState(272);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(value => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="shopping-cart" size={22} color={colors.white} />
        </View>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>New Order Received!</Text>
          <Text style={styles.bannerSubtitle}>
            {order.id} · {order.itemsCount} items · ₹{order.amount}
          </Text>
        </View>
        <View style={styles.countdownPill}>
          <Text style={styles.countdownValue}>{formatCountdown(secondsLeft)}</Text>
          <Text style={styles.countdownLabel}>ACCEPT BY</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderId}>ORD-2026-{order.id.replace('ORD-', '')}</Text>
              <Text style={styles.orderMeta}>
                {order.timeLabel} · {order.paymentMethod}
              </Text>
            </View>
            <Text style={styles.orderAmount}>₹{order.amount}</Text>
          </View>

          <View style={styles.customerRow}>
            <Icon name="user" size={16} color={colors.textSecondary} />
            <View style={styles.customerTextColumn}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerMeta}>
                {order.location} · {order.distanceLabel ?? '3.0 km away'}
              </Text>
            </View>
            <Text style={styles.loyaltyText}>{order.loyaltyLabel ?? 'New Customer'}</Text>
          </View>

          <InfoBanner
            variant="info"
            message={`Expected delivery by 12:00 PM (1h 26min)`}
            bordered
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Items ({order.products.length})</Text>
          {order.products.map((product, index) => (
            <View
              key={`${product.name}-${index}`}
              style={[styles.itemRow, index < order.products.length - 1 && styles.itemRowDivider]}
            >
              <View style={styles.itemIcon}>
                <Icon name="package" size={14} color={colors.textSecondary} />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.itemQty}>×{product.qty}</Text>
              <Text style={styles.itemPrice}>₹{product.price * product.qty}</Text>
            </View>
          ))}
        </View>

        {order.specialInstructions ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Special Instructions</Text>
            <View style={styles.instructionsBox}>
              <Icon name="alert-triangle" size={13} color={colors.warningDark} />
              <Text style={styles.instructionsText}>&quot;{order.specialInstructions}&quot;</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Reject"
          onPress={() => navigation.navigate('RejectOrderWarning', { orderId })}
          background={colors.errorSurface}
          textColor={colors.error}
          borderColor={colors.errorBorder}
          flex={1}
        />
        <FlexButton
          label="Accept Order →"
          onPress={() => navigation.navigate('AcceptOrderConfirm', { orderId })}
          background={colors.primary}
          textColor={colors.white}
          flex={1.9}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#1570EF',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    color: colors.white,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  countdownPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  countdownValue: {
    fontSize: 18,
    fontFamily: fontFamilies.black,
    color: colors.white,
  },
  countdownLabel: {
    fontSize: 9,
    fontFamily: fontFamilies.semibold,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 13,
    color: colors.textPrimary,
  },
  orderMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: 2,
  },
  orderAmount: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  customerTextColumn: {
    flex: 1,
    gap: 1,
  },
  customerName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  customerMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  loyaltyText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  instructionsText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
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
