import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { Badge, BadgeTone, NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityLoginHistory'>;

const STATUS_ICON: Record<'success' | 'failed', IconName> = {
  success: 'check-circle',
  failed: 'alert-circle',
};

const STATUS_ICON_COLOR: Record<'success' | 'failed', string> = {
  success: colors.primary,
  failed: colors.error,
};

const STATUS_ICON_BG: Record<'success' | 'failed', string> = {
  success: colors.primarySurface,
  failed: colors.errorSurface,
};

const STATUS_LABEL: Record<'success' | 'failed', string> = {
  success: 'Successful',
  failed: 'Failed attempt',
};

const STATUS_TONE: Record<'success' | 'failed', BadgeTone> = {
  success: 'success',
  failed: 'error',
};

export function SecurityLoginHistoryScreen({ navigation }: Props) {
  const { loginHistory } = useSecurity();

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Login History" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.caption}>{loginHistory.length} recent sign-in attempts</Text>

        <View style={styles.listCard}>
          {loginHistory.map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.row, index < loginHistory.length - 1 && styles.rowDivider]}
            >
              <View style={[styles.iconCircle, { backgroundColor: STATUS_ICON_BG[entry.status] }]}>
                <Icon name={STATUS_ICON[entry.status]} size={18} color={STATUS_ICON_COLOR[entry.status]} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.timestamp} numberOfLines={1}>
                  {entry.timestampLabel}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {entry.location} · {entry.deviceLabel}
                </Text>
              </View>
              <Badge label={STATUS_LABEL[entry.status]} tone={STATUS_TONE[entry.status]} />
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  caption: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  listCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + spacing.xs,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  timestamp: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
