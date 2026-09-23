import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationHero } from './NotificationHero';
import { DetailCard, DetailRow } from './DetailCard';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AnnouncementNotification'>;

const META = NOTIFICATION_CATEGORY_META.announcement;

export function AnnouncementNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification, markAsRead } = useNotifications();
  const notification = getNotification(notificationId);

  const handleAcknowledge = () => {
    markAsRead(notificationId);
    Alert.alert('Acknowledged', 'Thanks — this policy update has been acknowledged.');
    navigation.goBack();
  };

  const handleReadFullPolicy = () => {
    Alert.alert('Read Full Policy', 'This would open the full policy document.');
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Announcement" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Announcement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NotificationHero
          icon={META.icon}
          iconColor={META.iconColor}
          iconBg={META.iconBg}
          title={notification.title}
          subtitle={notification.subtitle}
          timeLabel={notification.timeLabel}
        />

        <View style={styles.section}>
          <View style={styles.changeBox}>
            <Text style={styles.changeLabel}>Commission Change</Text>
            <Text style={styles.changeText}>
              Commission rate changing from <Text style={styles.changeTextBold}>8%</Text> to{' '}
              <Text style={styles.changeTextBold}>7.5%</Text> for all product categories.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <DetailCard title="Key Dates">
            <DetailRow label="Announcement Date" value="3 Nov 2024" />
            <DetailRow label="Effective Date" value="1 Dec 2024" />
            <DetailRow label="First Applicable Settlement" value="Dec 2024" />
          </DetailCard>
        </View>

        <View style={styles.section}>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              All vendors must acknowledge this policy change. Failure to acknowledge by 30 Nov 2024
              may pause your account.
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.buttonGap]}>
          <Button label="Acknowledge" onPress={handleAcknowledge} />
        </View>
        <View style={styles.section}>
          <Button label="Read Full Policy" variant="outline" onPress={handleReadFullPolicy} />
        </View>
      </ScrollView>
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
  buttonGap: {
    paddingTop: spacing.xl,
  },
  changeBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.sm,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  changeLabel: {
    ...typography.labelSemibold,
    color: '#92400E',
  },
  changeText: {
    ...typography.label,
    color: '#92400E',
  },
  changeTextBold: {
    ...typography.labelSemibold,
    color: '#92400E',
  },
  noteBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  noteText: {
    ...typography.label,
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
