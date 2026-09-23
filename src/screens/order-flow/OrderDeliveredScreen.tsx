import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderDelivered'>;

export function OrderDeliveredScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <FlowStatusScreen
      icon="check"
      iconColor={colors.white}
      iconBg="rgba(255,255,255,0.15)"
      iconRingColor="rgba(255,255,255,0.25)"
      heading="Order Delivered!"
      headingSize={28}
      headingWeight="black"
      subtitle={`${order.id} successfully delivered to ${order.customerName} at 11:52 AM.`}
      gradient
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View All Orders"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'OrdersList' }] })}
              background={colors.white}
              textColor={colors.primary}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Back to Dashboard"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] })}
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
            <Text style={styles.statValue}>₹{order.amount}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>22 min</Text>
            <Text style={styles.statLabel}>Prep Time</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>33 min</Text>
            <Text style={styles.statLabel}>Delivery</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.ratingRow}>
          {[0, 1, 2, 3, 4].map(index => (
            <Icon key={index} name="star" size={18} color="#FCD34D" />
          ))}
          <Text style={styles.ratingText}>Customer rated {order.rating ?? 5}/5</Text>
        </View>
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
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
