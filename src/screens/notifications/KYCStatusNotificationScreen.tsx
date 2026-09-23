import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { NotificationHero } from './NotificationHero';
import { DetailCard } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCStatusNotification'>;

// KYC-approved teal accent used by this notification's success state — not
// part of the shared theme token set (see report for the gap), kept local.
const KYC_ACCENT = '#0891B2';
const KYC_ACCENT_DARK = '#0E7490';
const KYC_SURFACE = '#ECFEFF';
const KYC_BORDER = '#A5F3FC';

const VERIFIED_DOCUMENTS = ['PAN Card', 'Aadhaar Card', 'GST Certificate', 'Bank Details'];

export function KYCStatusNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const notification = getNotification(notificationId);
  const meta = NOTIFICATION_CATEGORY_META['kyc-status'];

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

  const combinedText = `${notification.title} ${notification.subtitle}`;
  const isApproved = /approv|verified/i.test(combinedText) && !/reject/i.test(combinedText);
  const isRejected = /reject/i.test(combinedText);

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="KYC Status Update" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={isRejected ? '#D92D20' : meta.iconColor}
        iconBg={isRejected ? '#FEF3F2' : meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {isApproved ? (
          <>
            <DetailCard title="Verified Documents">
              {VERIFIED_DOCUMENTS.map((doc, index) => (
                <View key={doc} style={[styles.docRow, index > 0 && styles.docRowSpacing]}>
                  <View style={styles.docIcon}>
                    <Icon name="check" size={12} color={KYC_ACCENT} />
                  </View>
                  <Text style={styles.docLabel}>{doc}</Text>
                  <Text style={styles.docStatus}>Verified</Text>
                </View>
              ))}
            </DetailCard>

            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                Your account is now fully active. You can start receiving orders.
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button
              label={isApproved ? 'Start Selling' : 'Got it'}
              onPress={() => (isApproved ? navigation.navigate('Dashboard') : navigation.goBack())}
            />
          </View>
          {isApproved || isRejected ? (
            <View style={styles.footerButton}>
              <Button
                label="View KYC Details"
                variant="outline"
                onPress={() => navigation.navigate(isRejected ? 'KYCRejected' : 'KYCApproved')}
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
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  docRowSpacing: {
    paddingTop: spacing.md + spacing.xxs,
  },
  docIcon: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    backgroundColor: KYC_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLabel: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  docStatus: {
    ...typography.captionSemibold,
    color: KYC_ACCENT,
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
