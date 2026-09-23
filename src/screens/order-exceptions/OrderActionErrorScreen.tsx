import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderActionError'>;

const TIPS = ['Check your internet connection', 'Wait a few seconds and try again', 'If issue persists, contact support'];

export function OrderActionErrorScreen({ navigation, route }: Props) {
  const { orderId, actionLabel } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <FlowStatusScreen
      headerTitle="Action Failed"
      onBack={() => navigation.goBack()}
      icon="alert-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Action Failed"
      subtitle={`Could not ${actionLabel.toLowerCase()} ${order.id}. The server returned an error. Your action was not saved.`}
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Dismiss"
            onPress={() => navigation.goBack()}
            background={colors.surface}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={1}
          />
          <FlexButton
            label="Retry Action"
            onPress={() => navigation.replace('RetryingAction', { orderId, actionLabel })}
            background={colors.primary}
            textColor={colors.white}
            flex={1.6}
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
        <View style={styles.row}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>ORD-2026-{order.id.replace('ORD-', '')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.valueMono}>Server timeout (503)</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{order.timeLabel}</Text>
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
