import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { usePayments } from '../../context/PaymentsContext';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SettlementNotification'>;

// Purple accent used by the "settlement" category — not part of the shared
// theme token set, so kept as a local constant (see report: Button has no
// accent-color override, so the outline CTA below is a custom Pressable).
const SETTLEMENT_ACCENT = '#7C3AED';

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function SettlementNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const { getSettlement } = usePayments();
  const notification = getNotification(notificationId);
  const meta = NOTIFICATION_CATEGORY_META.settlement;

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Settlement Credited" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const settlement = notification.settlementId ? getSettlement(notification.settlementId) : undefined;

  const heroTitle = settlement ? 'Settlement Credited' : notification.title;
  const heroSubtitle = settlement
    ? `${formatINR(settlement.netPayout)} credited to ${settlement.bankAccountLabel}`
    : notification.subtitle;

  const deductions = settlement
    ? settlement.commission + settlement.gstOnCommission + settlement.adjustments
    : 0;

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Settlement Credited" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        title={heroTitle}
        subtitle={heroSubtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {settlement ? (
          <>
            <DetailCard>
              <DetailRow label="Settlement ID" value={settlement.id} />
              <DetailRow label="Period" value={settlement.dateRangeLabel} />
              <DetailRow label="Bank Account" value={settlement.bankAccountLabel ?? '—'} />
            </DetailCard>

            <DetailCard title="Settlement Details">
              <DetailRow label="Gross Earnings" value={formatINR(settlement.netSales)} />
              <DetailRow label="Deductions" value={`-${formatINR(deductions)}`} />
              <DetailRow
                label="Net Settlement"
                value={formatINR(settlement.netPayout)}
                valueColor={colors.primary}
                bold
                divider
              />
            </DetailCard>

            <View style={styles.footer}>
              <Button
                label="View Settlement"
                onPress={() =>
                  navigation.navigate('SettlementDetails', { settlementId: settlement.id })
                }
              />
              <Pressable
                onPress={() => navigation.navigate('DownloadInvoice', { settlementId: settlement.id })}
                style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
              >
                <Icon name="file-text" size={18} color={SETTLEMENT_ACCENT} />
                <Text style={styles.outlineButtonLabel}>Download Invoice</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.footer}>
            <Button label="Got it" onPress={() => navigation.goBack()} />
          </View>
        )}
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
    gap: spacing.lg,
  },
  outlineButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: SETTLEMENT_ACCENT,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  outlineButtonPressed: {
    opacity: 0.85,
  },
  outlineButtonLabel: {
    ...typography.button,
    color: SETTLEMENT_ACCENT,
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
