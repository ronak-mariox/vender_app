import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import {
  AppNotification,
  NotificationGroup,
  NotificationTab,
  useNotifications,
} from '../../context/NotificationsContext';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { ScreenContainer, IconCircle } from '../../components';
import { Icon } from '../../icons/Icon';
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, undoMarkAllAsRead, refresh } = useNotifications();
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [countdown, setCountdown] = useState(UNDO_WINDOW_SECONDS);

  const previousRef = useRef<AppNotification[] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleMarkAllRead = useCallback(() => {
    previousRef.current = notifications;
    markAllAsRead();
    clearTimer();
    setCountdown(UNDO_WINDOW_SECONDS);
    setToastVisible(true);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          setToastVisible(false);
          previousRef.current = null;
          return UNDO_WINDOW_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  }, [notifications, markAllAsRead, clearTimer]);

  const handleUndo = useCallback(() => {
    clearTimer();
    setToastVisible(false);
    if (previousRef.current) {
      undoMarkAllAsRead(previousRef.current);
      previousRef.current = null;
    }
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
      markAsRead(item.id);
      const meta = NOTIFICATION_CATEGORY_META[item.category];
      const navigateToDetail = navigation.navigate as (
        name: typeof meta.route,
        params: { notificationId: string },
      ) => void;
      navigateToDetail(meta.route, { notificationId: item.id });
    },
    [markAsRead, navigation],
  );

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
          <Pressable onPress={handleMarkAllRead} hitSlop={8}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('ClearNotifications')}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityLabel="Clear all notifications"
          >
            <Icon name="trash" size={18} color={colors.textSecondary} />
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

      <View style={styles.hintBar}>
        <Text style={styles.hintText}>Swipe to dismiss</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="bell" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => <NotifRow item={item} onPress={() => handlePressRow(item)} />}
        />
      )}
    </ScreenContainer>
  );
}

function NotifRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const meta = NOTIFICATION_CATEGORY_META[item.category];
  return (
    <Pressable
      onPress={onPress}
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
  hintBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  hintText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.huge,
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
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
