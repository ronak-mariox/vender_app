import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSecurity'>;

function maskMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 4 ? `****${digits.slice(-4)}` : value;
}

export function ProfileSecurityScreen({ navigation }: Props) {
  const {
    securityScore,
    securityScoreTip,
    mobileNumber,
    pinLastChangedLabel,
    twoFactorEnabled,
    toggleTwoFactor,
    activeSessionCount,
    loginHistory,
  } = useSecurity();

  function handleToggleTwoFactor() {
    if (twoFactorEnabled) {
      Alert.alert(
        'Disable Two-Factor Authentication?',
        'This will reduce your account security. You can re-enable it anytime.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: toggleTwoFactor },
        ],
      );
    } else {
      toggleTwoFactor();
    }
  }

  const lastLogin = loginHistory[0];

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Security" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreIconCircle}>
              <Icon name="shield-check" size={26} color={colors.white} />
            </View>
            <View style={styles.scoreTextWrap}>
              <Text style={styles.scoreTitle}>Your account is secure</Text>
              <Text style={styles.scoreSubtitle}>Security Score</Text>
            </View>
            <View style={styles.scoreValueWrap}>
              <Text style={styles.scoreValue}>{securityScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          <View style={styles.scoreTrack}>
            <View style={[styles.scoreFill, { width: `${securityScore}%` }]} />
          </View>
          <Text style={styles.scoreTip}>{securityScoreTip}</Text>
        </View>

        <View style={styles.listCard}>
          <SecurityRow
            icon="smartphone"
            label="Change Mobile Number"
            value={maskMobile(mobileNumber)}
            onPress={() => navigation.navigate('SecurityChangeMobileNumber')}
          />
          <SecurityRow
            icon="lock"
            label="Change Password / PIN"
            value={`Last changed ${pinLastChangedLabel}`}
            onPress={() => navigation.navigate('SecurityChangePin')}
          />
          <SecurityRow
            icon="smartphone"
            label="Active Sessions"
            value={`${activeSessionCount} active device${activeSessionCount === 1 ? '' : 's'}`}
            onPress={() => navigation.navigate('SecurityActiveSessions')}
          />
          <SecurityRow
            icon="shield-check"
            label="Two-Factor Authentication"
            badge={twoFactorEnabled ? 'Enabled' : 'Disabled'}
            badgeTone={twoFactorEnabled ? 'success' : 'neutral'}
            onPress={handleToggleTwoFactor}
          />
          <SecurityRow
            icon="clock"
            label="Login History"
            value={lastLogin ? `${lastLogin.timestampLabel}, ${lastLogin.location}` : undefined}
            onPress={() => navigation.navigate('SecurityLoginHistory')}
            last
          />
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerHeader}>Danger Zone</Text>
          <Pressable
            style={styles.dangerCard}
            onPress={() => navigation.navigate('SecurityDeleteAccountConfirm')}
          >
            <View style={styles.dangerTextWrap}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerSubtitle}>Permanently remove your vendor account</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.error} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

type SecurityRowProps = {
  icon: IconName;
  label: string;
  value?: string;
  badge?: string;
  badgeTone?: 'success' | 'neutral';
  onPress: () => void;
  last?: boolean;
};

function SecurityRow({ icon, label, value, badge, badgeTone, onPress, last }: SecurityRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIconCircle}>
        <Icon name={icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View
          style={[
            styles.badge,
            badgeTone === 'success' ? styles.badgeSuccess : styles.badgeNeutral,
          ]}
        >
          <Text style={[styles.badgeText, badgeTone === 'success' && styles.badgeTextSuccess]}>{badge}</Text>
        </View>
      ) : null}
      <Icon name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge,
  },
  scoreCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scoreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextWrap: {
    flex: 1,
    gap: 2,
  },
  scoreTitle: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  scoreSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreValueWrap: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    ...typography.h2,
    fontSize: 24,
    lineHeight: 36,
    color: colors.primary,
  },
  scoreMax: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  scoreTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBorder,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  scoreFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  scoreTip: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  listCard: {
    marginTop: spacing.xl,
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
    paddingVertical: spacing.lg + 2,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  badgeNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  badgeTextSuccess: {
    color: colors.primary,
  },
  dangerSection: {
    marginTop: spacing.huge,
  },
  dangerHeader: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dangerCard: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
  },
  dangerTextWrap: {
    flex: 1,
    gap: 2,
  },
  dangerTitle: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  dangerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
