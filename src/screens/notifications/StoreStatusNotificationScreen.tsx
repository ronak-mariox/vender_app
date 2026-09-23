import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationHero } from './NotificationHero';
import { DetailCard } from './DetailCard';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreStatusNotification'>;

// Figma shows this specific "closed" status alert with a neutral/amber treatment
// rather than the green home-icon used for the store-status category badge elsewhere
// in the app (see NOTIFICATION_CATEGORY_META['store-status']). Matched pixel-faithfully here.
const STATUS_ICON_BG = '#F3F4F6';
const STATUS_ICON_COLOR = '#374151';

export function StoreStatusNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const notification = getNotification(notificationId);

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'This would connect you with the Verdant support team.');
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Store Status Update" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Store Status Update" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <NotificationHero
            icon="settings"
            iconColor={STATUS_ICON_COLOR}
            iconBg={STATUS_ICON_BG}
            title={notification.title}
            subtitle={notification.subtitle}
            timeLabel={notification.timeLabel}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Reason</Text>
            <Text style={styles.reasonText}>Multiple customer complaints received.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <DetailCard title="Consequences">
            <Text style={styles.bullet}>• New orders are paused</Text>
            <Text style={styles.bullet}>• Products hidden from customers</Text>
            <Text style={styles.bullet}>• Pending orders unaffected</Text>
          </DetailCard>
        </View>

        <View style={styles.section}>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              Contact support to reopen your store and resolve complaints.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleContactSupport}
          hitSlop={8}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
        >
          <Text style={styles.outlineButtonLabel}>Contact Support</Text>
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
  heroWrap: {
    backgroundColor: '#FFFAEB',
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  reasonBox: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  reasonLabel: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  reasonText: {
    ...typography.label,
    color: colors.error,
  },
  bullet: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tipBox: {
    backgroundColor: '#FFFAEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  tipText: {
    ...typography.label,
    color: '#92400E',
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
    borderColor: colors.error,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonPressed: {
    opacity: 0.85,
  },
  outlineButtonLabel: {
    ...typography.button,
    color: colors.error,
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
