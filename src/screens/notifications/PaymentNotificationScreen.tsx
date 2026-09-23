import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentNotification'>;

// The platform's standard commission rate, matching the convention used across
// settlements in PaymentsContext (e.g. STL-2024-0089 has commissionRate: 8).
const COMMISSION_RATE = 0.08;

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function PaymentNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const notification = getNotification(notificationId);
  const meta = NOTIFICATION_CATEGORY_META.payment;

  // AppNotification has no dedicated amount/commission field, so the gross
  // figure is derived from the real notification subtitle (e.g. "Rajesh Kumar
  // · ₹428") when present, then split using the platform's standard rate.
  const breakdown = useMemo(() => {
    if (!notification) return null;
    const match = notification.subtitle.match(/₹\s?([\d,]+(?:\.\d+)?)/);
    if (!match) return null;
    const gross = Number(match[1].replace(/,/g, ''));
    if (!Number.isFinite(gross) || gross <= 0) return null;
    const commission = Math.round(gross * COMMISSION_RATE);
    return { gross, commission, net: gross - commission };
  }, [notification]);

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Payment Update" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const orderId = notification.orderId;

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Payment Update" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {breakdown ? (
          <DetailCard title="Payment Breakdown">
            <DetailRow label="Gross Amount" value={formatINR(breakdown.gross)} />
            <DetailRow label="Platform Commission" value={`-${formatINR(breakdown.commission)}`} />
            <DetailRow label="Net Amount" value={formatINR(breakdown.net)} bold divider />
          </DetailCard>
        ) : null}

        {orderId ? (
          <DetailCard>
            <DetailRow label="Order ID" value={orderId} />
          </DetailCard>
        ) : null}

        <View style={styles.footer}>
          <Button
            label={orderId ? 'View Order Details' : 'Got it'}
            onPress={() =>
              orderId ? navigation.navigate('OrderDetails', { orderId }) : navigation.goBack()
            }
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  footer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
