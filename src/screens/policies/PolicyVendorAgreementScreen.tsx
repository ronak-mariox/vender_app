import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { usePolicies } from '../../context/PoliciesContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyVendorAgreement'>;

type DocRow = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

export function PolicyVendorAgreementScreen({ navigation }: Props) {
  const { vendorAgreement } = usePolicies();

  const documentRows: DocRow[] = [
    {
      key: 'full-agreement',
      icon: 'file-text',
      label: 'Full Agreement Text',
      onPress: () => navigation.navigate('VendorAgreement'),
    },
    {
      key: 'commission-schedule',
      icon: 'percent',
      label: 'Commission Schedule',
      onPress: () => Alert.alert('Commission Schedule', 'Coming soon.'),
    },
    {
      key: 'payout-terms',
      icon: 'credit-card',
      label: 'Payout Terms',
      onPress: () => Alert.alert('Payout Terms', 'Coming soon.'),
    },
    {
      key: 'code-of-conduct',
      icon: 'shield-check',
      label: 'Code of Conduct',
      onPress: () => Alert.alert('Code of Conduct', 'Coming soon.'),
    },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Vendor Agreement" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {vendorAgreement.newVersionAvailable ? (
          <InfoBanner
            variant="warning"
            message={`New version available — ${vendorAgreement.newVersionLabel} (review required)`}
          />
        ) : null}

        <View style={styles.card}>
          <Text style={styles.caption}>This agreement governs your partnership with Verdant.</Text>
          <View style={styles.versionRow}>
            <Text style={styles.versionText}>
              Version {vendorAgreement.version} · Signed: {vendorAgreement.signedLabel}
            </Text>
            <Badge label={vendorAgreement.status} tone="success" />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueGreen]}>
                {vendorAgreement.commissionRate}
              </Text>
              <Text style={styles.statLabel}>Commission</Text>
              <Text style={styles.statSub}>of net sales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{vendorAgreement.settlementCadence}</Text>
              <Text style={styles.statLabel}>Settlement</Text>
              <Text style={styles.statSub}>every Monday</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{vendorAgreement.slaLabel}</Text>
              <Text style={styles.statLabel}>SLA</Text>
              <Text style={styles.statSub}>to accept orders</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>DOCUMENT SECTIONS</Text>
        <View style={styles.rowsCard}>
          {documentRows.map((row, index) => (
            <Pressable
              key={row.key}
              style={[styles.row, index < documentRows.length - 1 && styles.rowDivider]}
              onPress={row.onPress}
            >
              <View style={styles.rowIconCircle}>
                <Icon name={row.icon} size={18} color={colors.textSecondary} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Icon name="chevron-right" size={18} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.downloadButton}
          onPress={() => Alert.alert('Download', 'Coming soon.')}
        >
          <Text style={styles.downloadButtonText}>Download Signed Copy</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  caption: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  versionText: {
    ...typography.captionSemibold,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  statValueGreen: {
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
  },
  statSub: {
    ...typography.tiny,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  sectionHeader: {
    ...typography.captionSemibold,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowsCard: {
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
    paddingVertical: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  downloadButton: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    ...typography.bodySemibold,
    color: colors.white,
  },
});
