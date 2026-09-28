import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getNotificationMeta } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCStatusNotification'>;

const KYC_ACCENT_DARK = '#0E7490';
const KYC_SURFACE = '#ECFEFF';
const KYC_BORDER = '#A5F3FC';

const ACCOUNT_STATUS_LABEL: Record<string, string> = {
  pending: 'Under review',
  active: 'Active',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

export function KYCStatusNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const { vendor } = useVendorAuth();
  const notification = getNotification(notificationId);
  const meta = getNotificationMeta('kyc-status');

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="KYC Status Update" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  // The notification itself carries no status field, so show the account's current real status.
  const status = vendor?.status ?? '';
  const isApproved = status === 'active';
  const isRejected = status === 'rejected';
  const isSuspended = status === 'suspended';

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="KYC Status Update" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={isRejected || isSuspended ? '#D92D20' : meta.iconColor}
        iconBg={isRejected || isSuspended ? '#FEF3F2' : meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {status ? (
          <DetailCard>
            <DetailRow label="Current account status" value={ACCOUNT_STATUS_LABEL[status] ?? status} bold />
          </DetailCard>
        ) : null}

        {isApproved ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Your account is active. You can receive orders.</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button
              label={isApproved ? 'Go to Dashboard' : isSuspended ? 'Contact Support' : 'Got it'}
              onPress={() => {
                if (isApproved) navigation.navigate('Dashboard');
                else if (isSuspended) navigation.navigate('HelpSupport');
                else navigation.goBack();
              }}
            />
          </View>
          {isRejected ? (
            <View style={styles.footerButton}>
              <Button
                label="View Details"
                variant="outline"
                onPress={() =>
                  navigation.navigate('KYCRejected', { rejectionReason: vendor?.rejectionReason ?? undefined })
                }
              />
            </View>
          ) : null}
        </View>
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
  banner: {
    backgroundColor: KYC_SURFACE,
    borderWidth: 1,
    borderColor: KYC_BORDER,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.label,
    color: KYC_ACCENT_DARK,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  footerButton: {
    flex: 1,
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
