import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'HandoverConfirmation'>;

export function HandoverConfirmationScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, handoverToPartner } = useOrders();
  const order = getOrder(orderId);
  const [confirming, setConfirming] = useState(false);
  if (!order) return null;

  async function handleConfirm() {
    if (confirming) return;
    setConfirming(true);
    try {
      await handoverToPartner(orderId);
      navigation.replace('OrderDispatched', { orderId });
    } catch (err) {
      Alert.alert('Could not update order', getApiErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <FlowStatusScreen
      icon="check-circle"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      heading="Confirm Handover?"
      subtitle={
        <Text style={styles.subtitle}>
          You are handing <Text style={styles.subtitleBold}>{order.id}</Text> to the delivery partner. This cannot
          be undone.
        </Text>
      }
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Cancel"
            onPress={() => navigation.goBack()}
            background={colors.surface}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={1}
            disabled={confirming}
          />
          <FlexButton
            label={confirming ? 'Confirming…' : 'Confirm Handover'}
            onPress={handleConfirm}
            background={colors.primary}
            textColor={colors.white}
            flex={1.9}
            disabled={confirming}
          />
        </View>
      }
    >
      <View style={styles.detailCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Partner</Text>
          <Text style={styles.value}>Pending assignment</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>—</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>
            {order.products.length} · ₹{order.amount}
          </Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>11:22 AM, 06 Sep</Text>
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
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  detailCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
