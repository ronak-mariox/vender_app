import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'AcceptOrderConfirm'>;

export function AcceptOrderConfirmScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, acceptOrder } = useOrders();
  const order = getOrder(orderId);
  const [accepting, setAccepting] = useState(false);
  if (!order) return null;

  async function handleAccept() {
    if (accepting) return;
    setAccepting(true);
    try {
      await acceptOrder(orderId);
      // Reset (not replace) so the resolved "New Order Received" / "Accept Order?" screens are
      // purged from the stack — otherwise pressing back later in the fulfillment flow would walk
      // back into them and re-show the accept prompt for an order that's already accepted.
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }, { name: 'InventoryCheck', params: { orderId } }] });
    } catch (err) {
      Alert.alert('Could not accept order', getApiErrorMessage(err));
    } finally {
      setAccepting(false);
    }
  }

  return (
    <FlowStatusScreen
      headerTitle="Accept Order"
      onBack={() => navigation.goBack()}
      icon="check-circle"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      heading="Accept this order?"
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.footerRow}>
            <FlexButton
              label="Cancel"
              onPress={() => navigation.goBack()}
              background={colors.surface}
              textColor={colors.textSecondary}
              borderColor={colors.border}
              flex={1}
              disabled={accepting}
            />
            <FlexButton
              label={accepting ? 'Accepting…' : 'Yes, Accept Order'}
              onPress={handleAccept}
              background={colors.primary}
              textColor={colors.white}
              flex={1.9}
              disabled={accepting}
            />
          </View>
          <Pressable
            hitSlop={8}
            style={styles.demoLinkWrapper}
            onPress={() =>
              navigation.navigate('OrderActionError', { orderId, actionLabel: 'Accept Order' })
            }
          >
            <Text style={styles.demoLink}>Simulate Failure (Demo)</Text>
          </Pressable>
        </View>
      }
    >
      <Text style={styles.subtitle}>
        By accepting, you commit to prepare and dispatch <Text style={styles.subtitleBold}>{order.id}</Text> by
        12:00 PM today.
      </Text>

      <View style={styles.checklistCard}>
        {[
          `All ${order.products.length} items are available in stock`,
          'I can prepare within 30 minutes',
          'Delivery will reach by 12:00 PM',
        ].map((label, index, list) => (
          <View key={label} style={[styles.checklistRow, index < list.length - 1 && styles.checklistRowDivider]}>
            <View style={styles.checkBadge}>
              <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.checklistText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order</Text>
          <Text style={styles.summaryValueMono}>{order.id}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Customer</Text>
          <Text style={styles.summaryValue}>{order.customerName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryTotal}>₹{order.amount}</Text>
        </View>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subtitleBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textSecondary,
  },
  checklistCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  checklistRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistText: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  summaryValueMono: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 12,
    color: colors.textPrimary,
  },
  summaryTotal: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    color: colors.primary,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  demoLinkWrapper: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  demoLink: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
});
