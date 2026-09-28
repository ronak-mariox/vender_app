import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Order, OrderStatus } from '../../context/OrdersContext';
import { colors, fontFamilies, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';
import { formatMoney, statusEventTime, useOrder } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDelivered'>;

function eventAt(order: Order, status: OrderStatus): number | undefined {
  const event = order.statusHistory.find(item => item.status === status);
  return event ? new Date(event.at).getTime() : undefined;
}

function durationLabel(from?: number, to?: number): string | null {
  if (from == null || to == null || to < from) return null;
  const minutes = Math.round((to - from) / 60000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function OrderDeliveredScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);

  if (!order) {
    return (
      <OrderLoadState
        title="Order Delivered"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const prepTime = durationLabel(eventAt(order, 'accepted'), eventAt(order, 'ready_for_pickup'));
  const deliveryTime = durationLabel(
    eventAt(order, 'out_for_delivery'),
    order.deliveredAt ? new Date(order.deliveredAt).getTime() : eventAt(order, 'delivered'),
  );
  const deliveredAt = statusEventTime(order, 'delivered');
  const stars = order.rating != null ? Math.round(order.rating) : null;

  return (
    <FlowStatusScreen
      icon="check"
      iconColor={colors.white}
      iconBg="rgba(255,255,255,0.15)"
      iconRingColor="rgba(255,255,255,0.25)"
      heading="Order Delivered!"
      headingSize={28}
      headingWeight="black"
      subtitle={`${order.orderNumber} was delivered to ${order.customerName}${deliveredAt ? ` · ${deliveredAt}` : ''}.`}
      gradient
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View All Orders"
              onPress={() => {
                navigation.popToTop();
                navigation.navigate('OrdersList');
              }}
              background={colors.white}
              textColor={colors.primary}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Back to Dashboard"
              onPress={() => navigation.popToTop()}
              background="rgba(255,255,255,0.12)"
              textColor="rgba(255,255,255,0.85)"
              borderColor="rgba(255,255,255,0.2)"
              flex={1}
            />
          </View>
        </View>
      }
    >
      <View style={styles.statCard}>
        <View style={styles.statRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{formatMoney(order.amount)}</Text>
            <Text style={styles.statLabel}>Order Total</Text>
          </View>
          {prepTime ? (
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{prepTime}</Text>
              <Text style={styles.statLabel}>Prep Time</Text>
            </View>
          ) : null}
          {deliveryTime ? (
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{deliveryTime}</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          ) : null}
        </View>
        {stars != null ? (
          <>
            <View style={styles.statDivider} />
            <View style={styles.ratingRow}>
              {[0, 1, 2, 3, 4].map(index => (
                <Icon key={index} name="star" size={18} color={index < stars ? '#FCD34D' : 'rgba(255,255,255,0.3)'} />
              ))}
              <Text style={styles.ratingText}>Customer rated {order.rating}/5</Text>
            </View>
            {order.review ? <Text style={styles.reviewText}>“{order.review}”</Text> : null}
          </>
        ) : null}
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.h3,
    fontSize: 18,
    fontFamily: fontFamilies.extrabold,
    letterSpacing: -0.54,
    color: colors.white,
  },
  statLabel: {
    ...typography.tiny,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: 'rgba(255,255,255,0.6)',
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ratingText: {
    ...typography.captionSemibold,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.md,
  },
  reviewText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
