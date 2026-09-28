import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  AppNotification,
  NotificationGroup,
  NotificationTab,
  useNotifications,
} from '../../context/NotificationsContext';
import { getNotificationMeta } from './notificationMeta';
import { ScreenContainer, IconCircle } from '../../components';
import { Icon } from '../../icons/Icon';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Notifications'>;

const TABS: { id: NotificationTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'orders', label: 'Orders' },
  { id: 'payments', label: 'Payments' },
  { id: 'system', label: 'System' },
];

const GROUP_ORDER: NotificationGroup[] = ['Today', 'Yesterday', 'Earlier'];

// Blue used for the unread badge pill + per-row unread indicator dot in the Figma design —
// distinct from any per-category accent color, so kept local rather than in the theme.
const UNREAD_BLUE = '#1570EF';
const UNDO_WINDOW_SECONDS = 5;

export function NotificationsScreen({ navigation }: Props) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    undoMarkAllAsRead,
    dismissNotification,
    refresh,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch {
      // error surfaced through context.error
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const [toastVisible, setToastVisible] = useState(false);
  const [countdown, setCountdown] = useState(UNDO_WINDOW_SECONDS);

  const undoIdsRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleMarkAllRead = useCallback(async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    let ids: string[];
    try {
      ids = await markAllAsRead();
    } catch (err) {
      Alert.alert('Could not mark all as read', getApiErrorMessage(err, 'Please try again.'));
      return;
    } finally {
      setMarkingAll(false);
    }
    if (ids.length === 0) return;
    undoIdsRef.current = ids;
    clearTimer();
    setCountdown(UNDO_WINDOW_SECONDS);
    setToastVisible(true);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          setToastVisible(false);
          undoIdsRef.current = [];
          return UNDO_WINDOW_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  }, [markingAll, unreadCount, markAllAsRead, clearTimer]);

  const handleUndo = useCallback(() => {
    clearTimer();
    setToastVisible(false);
    const ids = undoIdsRef.current;
    undoIdsRef.current = [];
    undoMarkAllAsRead(ids).catch(err => {
      Alert.alert('Could not undo', getApiErrorMessage(err, 'Please try again.'));
    });
  }, [clearTimer, undoMarkAllAsRead]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(item => !item.read);
      default:
        return notifications.filter(item => item.tabs.includes(activeTab));
    }
  }, [notifications, activeTab]);

  const sections = useMemo(() => {
    const groups: Partial<Record<NotificationGroup, AppNotification[]>> = {};
    filtered.forEach(item => {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group]!.push(item);
    });
    return GROUP_ORDER.filter(group => groups[group]?.length).map(group => ({
      title: group,
      data: groups[group]!,
    }));
  }, [filtered]);

  const handlePressRow = useCallback(
    (item: AppNotification) => {
      markAsRead(item.id).catch(() => {});
      navigation.navigate(getNotificationMeta(item.category).route, { notificationId: item.id });
    },
    [markAsRead, navigation],
  );

  const handleLongPressRow = useCallback(
    (item: AppNotification) => {
      Alert.alert('Dismiss notification?', item.title, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => {
            dismissNotification(item.id).catch(err => {
              Alert.alert('Could not dismiss', getApiErrorMessage(err, 'Please try again.'));
            });
          },
        },
      ]);
    },
    [dismissNotification],
  );

  const showEmpty = sections.length === 0;
  const emptyMessage = error && notifications.length === 0
    ? error
    : activeTab === 'all'
      ? 'No notifications yet'
      : `No ${activeTab === 'unread' ? 'unread' : activeTab} notifications`;

  return (
    <ScreenContainer scrollable={false} edges={['top', 'left', 'right', 'bottom']}>
      {toastVisible ? (
        <View style={styles.toast}>
          <View style={styles.toastLeft}>
            <Icon name="check-circle" size={16} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.toastText}>All notifications marked as read</Text>
          </View>
          <Pressable onPress={handleUndo} hitSlop={8}>
            <Text style={styles.toastUndo}>Undo ({countdown}s)</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Notifications
        </Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
          <Pressable onPress={handleMarkAllRead} hitSlop={8} disabled={unreadCount === 0 || markingAll}>
            <Text style={[styles.markAllRead, (unreadCount === 0 || markingAll) && styles.markAllReadDisabled]}>
              Mark all read
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('ClearNotifications')}
            hitSlop={8}
            style={styles.clearButton}
            disabled={notifications.length === 0}
            accessibilityLabel="Clear all notifications"
          >
            <Icon
              name="trash"
              size={18}
              color={notifications.length === 0 ? colors.textTertiary : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const active = tab.id === activeTab;
          const label = tab.id === 'unread' ? `Unread (${unreadCount})` : tab.label;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {error && notifications.length > 0 ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={showEmpty ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="bell" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{isLoading && !refreshing ? 'Loading…' : emptyMessage}</Text>
            {error && notifications.length === 0 && !isLoading ? (
              <Pressable onPress={handleRefresh} hitSlop={8}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <NotifRow item={item} onPress={() => handlePressRow(item)} onLongPress={() => handleLongPressRow(item)} />
        )}
      />
    </ScreenContainer>
  );
}

function NotifRow({
  item,
  onPress,
  onLongPress,
}: {
  item: AppNotification;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const meta = getNotificationMeta(item.category);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.row, { borderLeftColor: meta.accentColor }, !item.read && styles.rowUnread]}
    >
      <IconCircle
        icon={meta.icon}
        size={40}
        iconSize={20}
        iconColor={meta.iconColor}
        backgroundColor={meta.iconBg}
      />
      <View style={styles.rowContent}>
        <View style={styles.rowTitleLine}>
          <Text
            style={[styles.rowTitle, !item.read && styles.rowTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <Text style={styles.rowTime}>{item.timeLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  toastText: {
    ...typography.labelSemibold,
    color: colors.white,
    flexShrink: 1,
  },
  toastUndo: {
    ...typography.labelSemibold,
    color: colors.white,
    textDecorationLine: 'underline',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: UNREAD_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  countBadgeText: {
    ...typography.tinyBold,
    color: colors.white,
    lineHeight: 16.5,
  },
  markAllRead: {
    ...typography.label,
    color: colors.primary,
  },
  markAllReadDisabled: {
    color: colors.textTertiary,
  },
  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  errorBar: {
    backgroundColor: colors.errorSurface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.tiny,
    color: colors.error,
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  sectionLabel: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    backgroundColor: colors.white,
  },
  sectionLabelText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  rowUnread: {
    backgroundColor: '#FAFFFE',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  rowTitleUnread: {
    ...typography.bodySemibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UNREAD_BLUE,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowTime: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  retryText: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
});
