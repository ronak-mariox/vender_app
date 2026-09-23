import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SystemAlertNotification'>;

// Figma renders this alert with a neutral gray gear icon rather than the red
// alert-circle used for the system-alert category badge elsewhere in the app
// (see NOTIFICATION_CATEGORY_META['system-alert']). Matched pixel-faithfully here.
const ALERT_ICON_BG = '#F3F4F6';
const ALERT_ICON_COLOR = '#374151';

export function SystemAlertNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, markAsRead } = useNotifications();
  const notification = getNotification(notificationId);

  const handleDismiss = () => {
    markAsRead(notificationId);
    navigation.goBack();
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="System Alert" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="System Alert" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NotificationHero
          icon="settings"
          iconColor={ALERT_ICON_COLOR}
          iconBg={ALERT_ICON_BG}
          title={notification.title}
          subtitle={notification.subtitle}
          timeLabel={notification.timeLabel}
        />

        <View style={styles.section}>
          <DetailCard>
            <DetailRow label="Date" value="10 Nov 2024" />
            <DetailRow label="Time" value="2:00 AM – 4:00 AM IST" />
            <DetailRow label="Duration" value="~2 hours" />
          </DetailCard>
        </View>

        <View style={styles.section}>
          <DetailCard title="Impact During Maintenance">
            <Text style={styles.bullet}>• Order placement will be paused</Text>
            <Text style={styles.bullet}>• New customer registrations paused</Text>
            <Text style={[styles.bullet, styles.bulletPositive]}>• Settlements are not affected</Text>
          </DetailCard>
        </View>

        <View style={styles.section}>
          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>Preparation Tip</Text>
            <Text style={styles.tipText}>
              Complete all pending actions before the maintenance window begins.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleDismiss}
          hitSlop={8}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
        >
          <Text style={styles.outlineButtonLabel}>Dismiss</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  bullet: {
    ...typography.label,
    color: colors.textSecondary,
  },
  bulletPositive: {
    color: colors.primary,
  },
  tipBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tipLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  tipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  outlineButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonPressed: {
    opacity: 0.85,
  },
  outlineButtonLabel: {
    ...typography.button,
    color: colors.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
