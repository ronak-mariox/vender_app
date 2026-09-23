import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { InfoBanner } from '../../components';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'FailedOrderDetails'>;

function errorCodeFor(reason: string) {
  const slug = reason.toUpperCase().replace(/[^A-Z]+/g, '_').replace(/^_|_$/g, '');
  return `ERR_${slug}`;
}

function timelineFor(reason: string, customerName: string) {
  const isPayment = reason.toLowerCase().includes('payment');
  if (isPayment) {
    return [
      { label: `Order placed by ${customerName}`, failed: false },
      { label: 'Payment authorized by bank', failed: false },
      { label: 'Confirmation sent to payment gateway', failed: false },
      { label: `${reason} (>30s)`, failed: true },
      { label: 'Order marked as failed automatically', failed: true },
    ];
  }
  return [
    { label: `Order placed by ${customerName}`, failed: false },
    { label: 'Order processing started', failed: false },
    { label: reason, failed: true },
    { label: 'Order marked as failed automatically', failed: true },
  ];
}

export function FailedOrderDetailsScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order || !order.failReason) return null;

  const failedAt = order.statusHistory[order.statusHistory.length - 1]?.time ?? '';
  const errorCode = errorCodeFor(order.failReason);
  const timeline = timelineFor(order.failReason, order.customerName);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Failed</Text>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="alert-circle" size={20} color={colors.error} />
        </View>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>{order.id} failed to complete</Text>
          <Text style={styles.bannerSubtitle}>
            {order.failReason} · {order.timeLabel}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Failure Details</Text>
          <DetailRow label="Order ID" value={`ORD-2026-${order.id.replace('ORD-', '')}`} />
          <DetailRow label="Customer" value={`${order.customerName} · ${order.location.split(',')[0]}`} />
          <DetailRow label="Failure type" value={order.failReason} />
          <DetailRow label="Error code" value={errorCode} mono />
          <DetailRow label="Order total" value={`₹${order.amount}`} />
          <DetailRow label="Refund status" value="Auto-refund initiated" />
          <DetailRow label="Failed at" value={failedAt} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>What Happened</Text>
          {timeline.map((step, index) => (
            <View key={step.label} style={[styles.timelineRow, index > 0 && styles.timelineRowSpacing]}>
              <View style={[styles.timelineBadge, step.failed && styles.timelineBadgeFailed]}>
                <Icon name={step.failed ? 'x' : 'check'} size={10} color={colors.white} strokeWidth={3} />
              </View>
              <Text style={[styles.timelineText, step.failed && styles.timelineTextFailed]}>{step.label}</Text>
            </View>
          ))}
        </View>

        <InfoBanner
          variant="success"
          message="No action required from your end. This is a system issue and a full refund has been initiated for the customer."
        />
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Contact Support"
          onPress={() => Alert.alert('Contact Support', 'Coming soon.')}
          background={colors.surface}
          textColor={colors.textSecondary}
          borderColor={colors.border}
          flex={1}
        />
        <FlexButton
          label="Back to Orders"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'OrdersList' }] })}
          background={colors.primary}
          textColor={colors.white}
          flex={1.9}
        />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, last, mono }: { label: string; value: string; last?: boolean; mono?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailValueMono]}>{value}</Text>
    </View>
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
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(217,45,32,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 1,
  },
  bannerTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  detailValueMono: {
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timelineRowSpacing: {
    paddingTop: spacing.sm,
  },
  timelineBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBadgeFailed: {
    backgroundColor: colors.error,
  },
  timelineText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  timelineTextFailed: {
    color: colors.error,
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
