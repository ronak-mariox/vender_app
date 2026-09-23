import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useNotifications } from '../../context/NotificationsContext';
import { DetailCard, DetailRow } from './DetailCard';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'NotificationDetail'>;

export function NotificationDetailScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { notifications, getNotification, dismissNotification } = useNotifications();
  const notification = getNotification(notificationId);

  const currentIndex = useMemo(
    () => notifications.findIndex(item => item.id === notificationId),
    [notifications, notificationId],
  );
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < notifications.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      navigation.setParams({ notificationId: notifications[currentIndex - 1].id });
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigation.setParams({ notificationId: notifications[currentIndex + 1].id });
    }
  };

  const handleDelete = () => {
    dismissNotification(notificationId);
    navigation.goBack();
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Notification Detail" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const secondaryLine =
    notification.settlementId || notification.orderId || notification.productName || notification.subtitle;
  const description = `${notification.title}. ${notification.subtitle}. Received ${notification.timeLabel}. View the full ${meta.label.toLowerCase()} record below for more information.`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader
        title="Notification Detail"
        onBack={() => navigation.goBack()}
        rightLabel="Delete"
        onRightPress={handleDelete}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: meta.iconBg }]}>
            <Icon name={meta.icon} size={20} color={meta.iconColor} />
          </View>
          <View style={styles.headerTextColumn}>
            <Text style={styles.title} numberOfLines={2}>
              {notification.title}
            </Text>
            {secondaryLine ? (
              <Text style={styles.secondaryLine} numberOfLines={1}>
                {secondaryLine}
              </Text>
            ) : null}
            <Text style={styles.metaLine}>
              {notification.timeLabel} · Status: {notification.read ? 'Read' : 'Unread'}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        <View style={styles.section}>
          <DetailCard>
            <DetailRow label="Notification ID" value={notification.id} />
            <DetailRow label="Received at" value={notification.timeLabel} />
            <DetailRow label="Category" value={meta.label} />
          </DetailCard>
        </View>

        <View style={styles.section}>
          <Button
            label={`View ${meta.label} Details`}
            onPress={() =>
              // meta.route is typed as `keyof AuthStackParamList` in notificationMeta.ts, which
              // doesn't correlate the route name to its specific params type — every bespoke
              // category route in this map happens to take `{ notificationId }`, so this cast is safe.
              (navigation.navigate as (screen: keyof AuthStackParamList, params: { notificationId: string }) => void)(
                meta.route,
                { notificationId },
              )
            }
          />
        </View>

        <View style={styles.pagerRow}>
          <Pressable
            onPress={handlePrevious}
            disabled={!hasPrevious}
            hitSlop={8}
            style={[styles.pagerButton, !hasPrevious && styles.pagerButtonDisabled]}
          >
            <Icon name="arrow-left" size={16} color={hasPrevious ? colors.primary : colors.textTertiary} />
            <Text style={[styles.pagerLabel, !hasPrevious && styles.pagerLabelDisabled]}>Previous</Text>
          </Pressable>
          <Pressable
            onPress={handleNext}
            disabled={!hasNext}
            hitSlop={8}
            style={[styles.pagerButton, !hasNext && styles.pagerButtonDisabled]}
          >
            <Text style={[styles.pagerLabel, !hasNext && styles.pagerLabelDisabled]}>Next</Text>
            <Icon name="arrow-right" size={16} color={hasNext ? colors.primary : colors.textTertiary} />
          </Pressable>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  secondaryLine: {
    ...typography.label,
    color: colors.textSecondary,
  },
  metaLine: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  descriptionSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  pagerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  pagerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pagerButtonDisabled: {
    opacity: 0.5,
  },
  pagerLabel: {
    ...typography.label,
    color: colors.primary,
  },
  pagerLabelDisabled: {
    color: colors.textTertiary,
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
