import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, spacing, typography } from '../../theme';
import { OrderActionLayout } from './OrderActionLayout';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'FailedOrders'>;

export function FailedOrdersScreen({ navigation }: Props) {
  const { ordersByStatus } = useOrders();
  const failedOrders = ordersByStatus(['failed']);

  return (
    <OrderActionLayout
      title="Failed Orders"
      onBack={() => navigation.goBack()}
      banner={{
        variant: 'neutral',
        message: 'Failed orders due to payment, system, or delivery issues. Contact support if needed.',
      }}
      orders={failedOrders}
      onOrderPress={orderId => navigation.navigate('FailedOrderDetails', { orderId })}
      renderOrderExtra={order => (
        <View style={styles.row}>
          <Text style={styles.reasonText} numberOfLines={1}>
            {order.failReason}
          </Text>
          <FlexButton
            label="Contact Support"
            onPress={() => Alert.alert('Contact Support', 'Coming soon.')}
            background={colors.white}
            textColor={colors.primary}
            borderColor={colors.primary}
            flex={0}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  reasonText: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
});
