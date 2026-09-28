import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useNotifications } from '../../context/NotificationsContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ClearNotifications'>;

export function ClearNotificationsScreen({ navigation }: Props) {
  const { notifications, unreadCount, clearAll } = useNotifications();
  const total = notifications.length;
  const [clearing, setClearing] = useState(false);

  function handleCancel() {
    navigation.goBack();
  }

  async function handleClearAll() {
    setClearing(true);
    try {
      await clearAll();
      navigation.goBack();
    } catch (err) {
      setClearing(false);
      Alert.alert('Could not clear notifications', getApiErrorMessage(err, 'Please try again.'));
    }
  }

  return (
    <Pressable style={styles.backdrop} onPress={handleCancel}>
      <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.heading}>Clear all notifications?</Text>

          <Text style={styles.body}>
            This will permanently delete <Text style={styles.bodyBold}>{total} notification{total === 1 ? '' : 's'}</Text>. This
            action cannot be undone.
          </Text>

          {unreadCount > 0 ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} will also be cleared.
              </Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.clearButton} onPress={handleClearAll} disabled={clearing}>
              <Text style={styles.clearButtonText}>{clearing ? 'Clearing…' : 'Clear All'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xxxl,
  },
  heading: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  bodyBold: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  warningBox: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  warningText: {
    ...typography.label,
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
