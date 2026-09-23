import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeSettlementAdjustment'>;

export function DisputeSettlementAdjustmentScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  function handleBack() {
    navigation.goBack();
  }

  function handleContinue() {
    navigation.navigate('DisputeResolved', { disputeId });
  }

  if (!dispute) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <NavHeader title="Settlement Adjustment" onBack={handleBack} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Reached either from the support-decision path (vendorAdjustment set by
  // issueDecision) or from a vendor accepting the customer's claim outright
  // (no decision was ever issued, so vendorAdjustment is unset) — fall back
  // to the full claim amount in that case.
  const adjustmentAmount = dispute.vendorAdjustment ?? dispute.claimAmount;
  const settlementRef = `STL-2024-${dispute.id.replace(/\D/g, '')}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <NavHeader title="Settlement Adjustment" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successBanner}>
          <View style={styles.successIconCircle}>
            <Icon name="check" size={20} color={colors.white} strokeWidth={3} />
          </View>
          <View style={styles.successTextColumn}>
            <Text style={styles.successHeading}>Dispute Resolved</Text>
            <Text style={styles.successSubtitle}>Settlement adjustment applied</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ADJUSTMENT DETAILS</Text>
          <View style={styles.detailRows}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dispute ID</Text>
              <Text style={styles.detailValue}>{dispute.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Claim</Text>
              <Text style={styles.detailValue}>{`₹${dispute.claimAmount}`}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vendor Adjustment</Text>
              <Text style={styles.detailValue}>{`₹${adjustmentAmount}`}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Applied To</Text>
              <Text style={styles.detailValue}>{settlementRef}</Text>
            </View>
          </View>
        </View>

        <View style={styles.impactCard}>
          <Text style={styles.cardLabel}>NET SETTLEMENT IMPACT</Text>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Deduction from upcoming payment</Text>
            <Text style={styles.impactValue}>{`-₹${adjustmentAmount}`}</Text>
          </View>
        </View>

        <Button label="View Settlement" onPress={handleContinue} />

        <Text style={styles.footerNote}>
          This adjustment will appear in your next settlement breakdown.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg + 2,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  successIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextColumn: {
    flex: 1,
    gap: 2,
  },
  successHeading: {
    ...typography.bodySemibold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: colors.primaryDark,
  },
  successSubtitle: {
    ...typography.label,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardLabel: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  detailRows: {
    gap: spacing.lg - 2,
    paddingTop: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  impactCard: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  impactLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  impactValue: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.error,
  },
  footerNote: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
