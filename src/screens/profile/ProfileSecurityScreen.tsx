import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSecurity'>;

function maskMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 4 ? `****${digits.slice(-4)}` : value;
}

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} isn't available in the app yet. Contact support if you need help.`);
}

export function ProfileSecurityScreen({ navigation }: Props) {
  const { vendor } = useVendorAuth();

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Security" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listCard}>
          <SecurityRow
            icon="smartphone"
            label="Change Mobile Number"
            value={vendor?.phone ? maskMobile(vendor.phone) : undefined}
            badge="Coming soon"
            onPress={() => comingSoon('Changing your mobile number')}
          />
          <SecurityRow
            icon="lock"
            label="Change Password / PIN"
            badge="Coming soon"
            onPress={() => comingSoon('Changing your password or PIN')}
          />
          <SecurityRow
            icon="smartphone"
            label="Current device"
            value="Signed in on this device"
            last
          />
        </View>

        <View style={styles.listCard}>
          <SecurityRow
            icon="arrow-right"
            label="Sign Out"
            onPress={() => navigation.navigate('SecurityLogout')}
            last
          />
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerHeader}>Danger Zone</Text>
          <Pressable style={styles.dangerCard} onPress={() => comingSoon('Account deletion')}>
            <View style={styles.dangerTextWrap}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerSubtitle}>Coming soon — contact support to close your account</Text>
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
  onPress?: () => void;
  last?: boolean;
};

function SecurityRow({ icon, label, value, badge, onPress, last }: SecurityRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
      disabled={!onPress}
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
        <View style={[styles.badge, styles.badgeNeutral]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {onPress ? <Icon name="chevron-right" size={18} color={colors.textTertiary} /> : null}
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
    gap: spacing.xl,
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
  badgeNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  dangerSection: {
    marginTop: spacing.xl,
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
