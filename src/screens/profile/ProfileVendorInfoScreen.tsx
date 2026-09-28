import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, useProfileRefreshOnFocus } from '../../context/ProfileContext';
import { Badge, Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileVendorInfo'>;

function maskMiddle(value: string): string {
  if (value.length <= 6) {
    return value;
  }
  return `${value.slice(0, 5)}••••${value.slice(-1)}`;
}

function InfoRow({
  label,
  value,
  valueNode,
  last,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {valueNode ? (
        <View style={styles.infoValueRow}>{valueNode}</View>
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

export function ProfileVendorInfoScreen({ navigation }: Props) {
  const { profile } = useProfile();
  useProfileRefreshOnFocus();
  const { vendor } = profile;

  const handleCopyGst = () => {
    // No clipboard library is installed in this project (RN core's own
    // Clipboard export was removed in 0.65+, and this app is on 0.81), so
    // surface the full value for the vendor to copy manually instead of
    // calling into a module that no longer exists at runtime.
    Alert.alert('GSTIN', vendor.gstNumber);
  };

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Vendor Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Business Details</Text>
        </View>
        <View style={styles.card}>
          <InfoRow label="Business Name" value={vendor.legalName} />
          <InfoRow label="Business Type" value={vendor.businessType} />
          <InfoRow
            label="GSTIN"
            valueNode={
              <>
                <Text style={[styles.infoValue, styles.infoValueFlex]}>{vendor.gstNumber}</Text>
                <Pressable style={styles.copyButton} onPress={handleCopyGst} hitSlop={8}>
                  <Icon name="eye" size={13} color={colors.textSecondary} />
                  <Text style={styles.copyButtonText}>View</Text>
                </Pressable>
              </>
            }
          />
          <InfoRow label="PAN" value={maskMiddle(vendor.panNumber)} />
          <InfoRow label="Store ID" value={profile.vendorCode} />
          <InfoRow label="Registration Date" value={profile.store.onboardedLabel} />
          <InfoRow
            label="Status"
            valueNode={
              <Badge
                label={profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : '—'}
                tone={profile.status === 'active' ? 'success' : profile.status === 'pending' ? 'warning' : 'error'}
              />
            }
            last
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button label="Edit Business Address" onPress={() => navigation.navigate('ProfileEditVendorInfo')} />
        </View>

        <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <Icon name="info" size={14} color={colors.warningDark} />
            <Text style={styles.bannerText}>Business name, type, GSTIN and PAN are verified KYC details. Contact support to change them.</Text>
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
  card: {
    backgroundColor: colors.white,
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
  infoLabel: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  infoValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoValueFlex: {
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  copyButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
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
    backgroundColor: colors.warningSurface,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
});
