import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, useProfileRefreshOnFocus } from '../../context/ProfileContext';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileOwnerInfo'>;

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon?: IconName;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      {icon ? (
        <View style={styles.infoIcon}>
          <Icon name={icon} size={14} color={colors.textSecondary} />
        </View>
      ) : null}
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function ProfileOwnerInfoScreen({ navigation }: Props) {
  const { profile } = useProfile();
  useProfileRefreshOnFocus();
  const { owner } = profile;

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Owner Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
          </View>
          <Text style={styles.ownerName}>{owner.name}</Text>
          <Text style={styles.ownerRole}>Store Owner</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Full Name" value={owner.name} />
          <InfoRow icon="phone" label="Mobile" value={owner.phone} />
          <InfoRow icon="mail" label="Email" value={owner.email} />
          <InfoRow label="Date of Birth" value={owner.dateOfBirth} last />
        </View>

        <View style={styles.buttonWrapper}>
          <Button label="Edit Owner Details" onPress={() => navigation.navigate('ProfileEditOwnerInfo')} />
        </View>

        <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <Icon name="lock" size={13} color={colors.primaryDark} />
            <Text style={styles.bannerText}>Personal information is encrypted and secure.</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    ...typography.h3,
    fontSize: 20,
    lineHeight: 30,
    color: colors.white,
  },
  ownerName: {
    ...typography.bodySemibold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  ownerRole: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 14,
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    width: 96,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonWrapper: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  bannerWrapper: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
});
