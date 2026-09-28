import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, useProfileRefreshOnFocus } from '../../context/ProfileContext';
import { Badge, ScreenContainer } from '../../components';
import type { BadgeTone } from '../../components';
import { getApiErrorMessage } from '../../services/api';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Profile'>;

type MenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const STATUS_BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  pending: { label: 'Under Review', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'error' },
  rejected: { label: 'Rejected', tone: 'error' },
};

export function ProfileScreen({ navigation }: Props) {
  const { profile, updateAvatar } = useProfile();
  useProfileRefreshOnFocus();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const statusBadge = STATUS_BADGE[profile.status];

  async function handleChangeAvatar() {
    if (uploadingAvatar) return;
    setUploadingAvatar(true);
    try {
      await updateAvatar();
    } catch (err) {
      Alert.alert('Could not update photo', getApiErrorMessage(err, 'Please try again.'));
    } finally {
      setUploadingAvatar(false);
    }
  }

  const sections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        { key: 'vendor', icon: 'building', label: 'Vendor Information', onPress: () => navigation.navigate('ProfileVendorInfo') },
        { key: 'owner', icon: 'user', label: 'Owner Information', onPress: () => navigation.navigate('ProfileOwnerInfo') },
        { key: 'store', icon: 'home', label: 'Store Information', onPress: () => navigation.navigate('ProfileStoreInfo') },
        { key: 'addresses', icon: 'pin', label: 'Addresses', onPress: () => navigation.navigate('ProfileAddresses') },
      ],
    },
    {
      title: 'Documents',
      items: [
        { key: 'documents', icon: 'file-text', label: 'Documents & KYC', onPress: () => navigation.navigate('ProfileDocuments') },
        { key: 'bank', icon: 'credit-card', label: 'Bank Details', onPress: () => navigation.navigate('ProfileBankDetails') },
      ],
    },
    {
      title: 'Operations',
      items: [
        { key: 'hours', icon: 'clock', label: 'Operating Hours', onPress: () => navigation.navigate('OperatingHours') },
        { key: 'notifications', icon: 'bell', label: 'Notification Settings', onPress: () => navigation.navigate('ProfileNotificationSettings') },
      ],
    },
    {
      title: 'Settings',
      items: [
        { key: 'security', icon: 'lock', label: 'Security', onPress: () => navigation.navigate('ProfileSecurity') },
        { key: 'help', icon: 'info', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport') },
      ],
    },
    {
      title: 'Legal',
      items: [
        { key: 'terms', icon: 'file-text', label: 'Terms & Conditions', onPress: () => navigation.navigate('PolicyTerms') },
        { key: 'privacy', icon: 'shield-check', label: 'Privacy Policy', onPress: () => navigation.navigate('PolicyPrivacy') },
        { key: 'vendor-agreement', icon: 'briefcase', label: 'Vendor Agreement', onPress: () => navigation.navigate('PolicyVendorAgreement') },
        { key: 'cancellation-policy', icon: 'x-circle', label: 'Cancellation Policy', onPress: () => navigation.navigate('PolicyCancellation') },
        { key: 'settlement-policy', icon: 'credit-card', label: 'Settlement Policy', onPress: () => navigation.navigate('PolicySettlement') },
      ],
    },
  ];

  const handleSignOut = () => {
    navigation.navigate('SecurityLogout');
  };

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Pressable
            style={styles.avatar}
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
            accessibilityLabel="Change profile photo"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color={colors.white} />
            ) : profile.avatarUrl ? (
              <Image source={{ uri: resolveAssetUrl(profile.avatarUrl) }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
            )}
            <View style={styles.avatarEditBadge}>
              <Icon name="camera" size={12} color={colors.primary} />
            </View>
          </Pressable>
          <Text style={styles.storeName}>{profile.storeName}</Text>
          <Text style={styles.vendorCode}>{profile.vendorCode}</Text>
          <View style={styles.chipRow}>
            {statusBadge ? <Badge label={statusBadge.label} tone={statusBadge.tone} /> : null}
            {profile.kycVerified ? (
              <Badge label="KYC Verified" tone="success" icon="shield-check" />
            ) : profile.kycStatus === 'rejected' ? (
              <Badge label="KYC Rejected" tone="error" />
            ) : profile.kycStatus ? (
              <Badge label="KYC Pending" tone="warning" />
            ) : null}
          </View>

          <View style={styles.statStrip}>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <Text style={styles.statValue}>{profile.stats.orders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <Text style={styles.statValue}>₹{profile.stats.revenue.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>
                {profile.stats.rating !== null ? `${profile.stats.rating}★` : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {sections.map(section => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
            <View style={styles.sectionBody}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={item.onPress}
                  style={({ pressed }) => [
                    styles.menuRow,
                    index < section.items.length - 1 && styles.menuRowDivider,
                    pressed && styles.menuRowPressed,
                  ]}
                >
                  <View style={styles.menuIconCircle}>
                    <Icon name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Icon name="chevron-right" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutRow, pressed && styles.menuRowPressed]}
        >
          <Icon name="arrow-right" size={18} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <View style={styles.signOutSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    fontSize: 28,
    lineHeight: 42,
    color: colors.white,
  },
  storeName: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  vendorCode: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xxs,
  },
  statStrip: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statValue: {
    ...typography.bodySemibold,
    fontFamily: typography.h3.fontFamily,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  sectionHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionBody: {
    backgroundColor: colors.white,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
  },
  menuRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.md - 2,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  signOutText: {
    ...typography.bodySemibold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.error,
  },
  signOutSpacer: {
    height: spacing.xl,
  },
});
