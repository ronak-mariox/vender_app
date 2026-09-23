import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCApproved'>;

const NEXT_STEPS: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'home', title: 'Add your first products', subtitle: 'Start building your catalog' },
  { icon: 'credit-card', title: 'Set up payment preferences', subtitle: 'Configure settlement schedule' },
  { icon: 'pin', title: 'Configure delivery zones', subtitle: 'Define your service area' },
];

function formatToday() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function KYCApprovedScreen({ navigation }: Props) {
  const { data } = useRegistration();

  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle icon="check" size={100} iconSize={52} />
          <Text style={styles.heading}>KYC Approved!</Text>
          <Text style={styles.subtitle}>Congratulations! Your account is fully verified and activated.</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="shield-check" size={18} color={colors.primaryDark} />
            <Text style={styles.statusHeaderText}>Account Verified & Active</Text>
          </View>
          <View style={styles.statusRows}>
            <StatusRow label="Approval Date" value={formatToday()} />
            <StatusRow label="Reference ID" value={data.referenceId ?? '—'} />
            <StatusRow label="Account Status" value="Active" valueColor={colors.primary} />
            <StatusRow label="Store Name" value={data.storeInfo?.storeName ?? '—'} />
          </View>
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>What's Next</Text>
          {NEXT_STEPS.map((step, index) => (
            <Pressable
              key={step.title}
              style={[styles.nextRow, index < NEXT_STEPS.length - 1 && styles.nextRowDivider]}
              onPress={() => Alert.alert(step.title, 'Coming soon.')}
            >
              <View style={styles.nextIcon}>
                <Icon name={step.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.nextTextColumn}>
                <Text style={styles.nextRowTitle}>{step.title}</Text>
                <Text style={styles.nextRowSubtitle}>{step.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Go to Dashboard" onPress={() => navigation.navigate('RegistrationComplete')} />
          <Button
            label="Set Up Your First Listing"
            variant="outline"
            onPress={() => Alert.alert('Set Up Your First Listing', 'Coming soon.')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function StatusRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusRowLabel}>{label}</Text>
      <Text style={[styles.statusRowValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statusCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    gap: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusHeaderText: {
    ...typography.labelSemibold,
    color: colors.primaryDark,
  },
  statusRows: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusRowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusRowValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  nextCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  nextTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    paddingBottom: spacing.sm,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  nextRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nextIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTextColumn: {
    flex: 1,
    gap: 1,
  },
  nextRowTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  nextRowSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
