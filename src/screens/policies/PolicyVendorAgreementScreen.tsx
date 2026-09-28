import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { GST_ON_FEE_PERCENT_LABEL, PLATFORM_FEE_PERCENT_LABEL } from '../../constants/fees';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyVendorAgreement'>;

type DocRow = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

export function PolicyVendorAgreementScreen({ navigation }: Props) {
  const documentRows: DocRow[] = [
    { key: 'terms', icon: 'file-text', label: 'Terms & Conditions', onPress: () => navigation.navigate('PolicyTerms') },
    {
      key: 'settlement',
      icon: 'credit-card',
      label: 'Settlement Policy',
      onPress: () => navigation.navigate('PolicySettlement'),
    },
    {
      key: 'cancellation',
      icon: 'x-circle',
      label: 'Cancellation Policy',
      onPress: () => navigation.navigate('PolicyCancellation'),
    },
    {
      key: 'privacy',
      icon: 'shield-check',
      label: 'Privacy Policy',
      onPress: () => navigation.navigate('PolicyPrivacy'),
    },
  ];

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Vendor Agreement" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.caption}>
            This agreement governs your partnership with Verdant. You accepted it during registration.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueGreen]}>{PLATFORM_FEE_PERCENT_LABEL}</Text>
              <Text style={styles.statLabel}>Commission</Text>
              <Text style={styles.statSub}>+ {GST_ON_FEE_PERCENT_LABEL} GST on fee</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>Per order</Text>
              <Text style={styles.statLabel}>Settlement</Text>
              <Text style={styles.statSub}>recorded on delivery</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>RELATED POLICIES</Text>
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
});
