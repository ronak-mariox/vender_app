import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useNotifications } from '../../context/NotificationsContext';
import { DetailCard, DetailRow } from './DetailCard';
import { getNotificationMeta } from './notificationMeta';
import { useNotificationOrder } from './useNotificationOrder';
import { openOrder } from '../orders/orderHelpers';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'NotificationDetail'>;

export function NotificationDetailScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { notifications, getNotification, dismissNotification } = useNotifications();
  const notification = getNotification(notificationId);
  const { order } = useNotificationOrder(notification?.orderId);

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
    dismissNotification(notificationId)
      .then(() => navigation.goBack())
      .catch(err => Alert.alert('Could not delete', getApiErrorMessage(err, 'Please try again.')));
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

  const meta = getNotificationMeta(notification.category);
  const secondaryLine = notification.orderNumber
    ? `Order ${notification.orderNumber}`
    : notification.productName;
  const receivedAt = new Date(notification.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const productId = notification.productId;
  const action: { label: string; onPress: () => void } | null =
    meta.route !== 'NotificationDetail'
      ? {
          label: `View ${meta.label} Details`,
          onPress: () =>
            // Every bespoke notification route takes `{ notificationId }`.
            (navigation.navigate as (screen: typeof meta.route, params: { notificationId: string }) => void)(
              meta.route,
              { notificationId },
            ),
        }
      : order
        ? { label: 'View Order', onPress: () => openOrder(navigation, order) }
        : productId
          ? { label: 'View Product', onPress: () => navigation.navigate('ProductDetails', { productId }) }
          : null;

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
          <Text style={styles.descriptionText}>{notification.subtitle}</Text>
        </View>

        <View style={styles.section}>
          <DetailCard>
            <DetailRow label="Received at" value={receivedAt} />
            <DetailRow label="Category" value={meta.label} />
          </DetailCard>
        </View>

        {action ? (
          <View style={styles.section}>
            <Button label={action.label} onPress={action.onPress} />
          </View>
        ) : null}

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
