import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';

type Props = NativeStackScreenProps<AuthStackParamList, 'CompletedOrders'>;

export function CompletedOrdersScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const completedOrders = ordersByStatus(['completed']);

  const revenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
  const ratings = completedOrders.filter(order => typeof order.rating === 'number').map(order => order.rating as number);
  const avgRating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0;

  return (
    <OrderActionLayout
      title="Completed"
      onBack={() => navigation.goBack()}
      rightLink={{ label: 'Filter', onPress: () => Alert.alert('Filter Completed', 'Coming soon.') }}
      orders={completedOrders}
      onOrderPress={orderId => navigation.navigate('OrderDetails', { orderId })}
      beforeOrders={
        <View style={styles.statsRow}>
          <StatTile label="Orders" value={String(completedOrders.length)} tone="neutral" />
          <StatTile label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} tone="success" />
          <StatTile label="Avg Rating" value={avgRating ? `${avgRating.toFixed(1)}★` : '—'} tone="neutral" />
        </View>
      }
      renderOrderExtra={order =>
        order.review ? (
          <View style={styles.reviewRow}>
            <View style={styles.starsRow}>
              {[0, 1, 2, 3, 4].map(index => (
                <Icon key={index} name="star" size={13} color={colors.warning} />
              ))}
            </View>
            <Text style={styles.reviewText}>{order.review}</Text>
          </View>
        ) : null
      }
    />
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'success' }) {
  const background = tone === 'success' ? colors.primarySurface : colors.surface;
  const color = tone === 'success' ? colors.primary : colors.textPrimary;
  return (
    <View style={[styles.statTile, { backgroundColor: background }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  statTile: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 17,
    fontFamily: fontFamilies.extrabold,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  reviewRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
