import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'RetryingAction'>;

export function RetryingActionScreen({ navigation, route }: Props) {
  const { orderId, actionLabel } = route.params;
  const { getOrder, acceptOrder } = useOrders();
  const order = getOrder(orderId);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      acceptOrder(orderId)
        .then(() => {
          if (!cancelled) navigation.replace('ActionRecovered', { orderId, actionLabel });
        })
        .catch(() => {
          if (!cancelled) navigation.replace('OrderActionError', { orderId, actionLabel });
        });
    }, 1800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [acceptOrder, actionLabel, navigation, orderId]);

  if (!order) return null;

  return (
    <FlowStatusScreen
      icon="refresh-cw"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      heading="Retrying..."
      subtitle={`Attempting to ${actionLabel.toLowerCase()} ${order.id} again. Please wait.`}
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="Cancel Retry"
            onPress={() => navigation.goBack()}
            background={colors.surface}
            textColor={colors.textSecondary}
            borderColor={colors.border}
            flex={0}
          />
        </View>
      }
    >
      <View style={styles.attemptsCard}>
        <AttemptRow index={1} status="Failed (503)" tone="error" />
        <AttemptRow index={2} status="In progress..." tone="active" last />
      </View>
    </FlowStatusScreen>
  );
}

function AttemptRow({
  index,
  status,
  tone,
  last,
}: {
  index: number;
  status: string;
  tone: 'error' | 'active';
  last?: boolean;
}) {
  return (
    <View style={[styles.attemptRow, !last && styles.attemptRowDivider]}>
      <View style={[styles.attemptBadge, tone === 'active' && styles.attemptBadgeActive]}>
        <Icon
          name={tone === 'error' ? 'x' : 'refresh-cw'}
          size={12}
          color={tone === 'error' ? colors.error : colors.primary}
        />
      </View>
      <Text style={styles.attemptLabel}>Attempt {index}</Text>
      <Text style={[styles.attemptStatus, tone === 'active' && styles.attemptStatusActive]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  attemptsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  attemptRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attemptBadge: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptBadgeActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySurface,
  },
  attemptLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  attemptStatus: {
    ...typography.tinyBold,
    color: colors.error,
  },
  attemptStatusActive: {
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
