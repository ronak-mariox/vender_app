import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';
import { MAX_ACTION_ATTEMPTS, ORDER_ACTION_LABEL, routeAfterAction, useRunOrderAction } from '../orders/orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderActionError'>;

const TIPS = ['Check your internet connection', 'Wait a few seconds and try again', 'If the issue persists, contact support'];

export function OrderActionErrorScreen({ navigation, route }: Props) {
  const { orderId, action, note, message } = route.params;
  const { getOrder } = useOrders();
  const runAction = useRunOrderAction();
  const order = getOrder(orderId);
  const [retries, setRetries] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [lastError, setLastError] = useState(message ?? '');
  const actionLabel = ORDER_ACTION_LABEL[action];
  const retriesLeft = MAX_ACTION_ATTEMPTS - retries;

  async function handleRetry() {
    if (retrying || retriesLeft <= 0) return;
    setRetrying(true);
    try {
      await runAction(action, orderId, note);
      const target = routeAfterAction(action, orderId, note);
      navigation.replace(target.name, target.params as never);
    } catch (err) {
      setLastError(getApiErrorMessage(err));
      setRetries(value => value + 1);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <FlowStatusScreen
      headerTitle="Action Failed"
      onBack={() => navigation.goBack()}
      icon="alert-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Action Failed"
      subtitle={`Could not ${actionLabel.toLowerCase()}${order ? ` for ${order.orderNumber}` : ''}. Your action was not saved.`}
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Dismiss"
            onPress={() => navigation.goBack()}
            background={colors.surface}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={1}
            disabled={retrying}
          />
          <FlexButton
            label={retrying ? 'Retrying…' : retriesLeft > 0 ? 'Retry Action' : 'No retries left'}
            onPress={handleRetry}
            background={retriesLeft > 0 ? colors.primary : colors.textTertiary}
            textColor={colors.white}
            flex={1.6}
            disabled={retrying || retriesLeft <= 0}
          />
        </View>
      }
    >
      <View style={styles.errorCard}>
        <Text style={styles.sectionLabel}>Error Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Action</Text>
          <Text style={styles.value}>{actionLabel}</Text>
        </View>
        {order ? (
          <View style={styles.row}>
            <Text style={styles.label}>Order</Text>
            <Text style={styles.value}>{order.orderNumber}</Text>
          </View>
        ) : null}
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.valueMono}>{lastError || 'Unknown error'}</Text>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>What you can do:</Text>
        {TIPS.map(tip => (
          <View key={tip} style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  valueMono: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Courier',
    fontSize: 12,
    color: colors.textPrimary,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  tipsTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipBullet: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tipText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
