import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { usePayments } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TransactionDetails'>;

function formatINR(value: number): string {
  return `₹${Math.round(Math.abs(value)).toLocaleString('en-IN')}`;
}

export function TransactionDetailsScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);

  if (!settlement) {
    return (
      <ScreenContainer scrollable={false} backgroundColor={colors.white}>
        <NavHeader title="Transaction Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Settlement not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const detailRows = [
    { key: 'id', label: 'Transaction ID', value: settlement.transactionRef ?? '—' },
    { key: 'type', label: 'Type', value: 'Settlement Credit' },
    { key: 'from', label: 'From', value: 'Verdant Payments' },
    { key: 'to', label: 'To', value: settlement.bankAccountLabel },
    { key: 'ref', label: 'Reference', value: settlement.id },
  ];

  // Only mark tracker steps complete up to what the settlement's real status implies.
  const stepComplete = settlement.status === 'paid' ? [true, true, true] : [true, false, false];
  const steps = [
    { label: 'Initiated', complete: stepComplete[0] },
    { label: 'Processing', complete: stepComplete[1] },
    { label: 'Credited', complete: stepComplete[2] },
  ];

  function handleDownloadReceipt() {
    navigation.navigate('DownloadInvoice', { settlementId });
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Transaction Details" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <IconCircle icon="check" size={56} iconSize={28} />
          <Text style={styles.heroLabel}>Settlement Credit</Text>
          <Text style={styles.heroAmount}>{formatINR(settlement.netPayout)}</Text>
          <Text style={styles.heroDate}>{settlement.transactionDate ?? settlement.dateRangeLabel}</Text>
        </View>

        <View style={styles.detailCard}>
          {detailRows.map((row, index) => (
            <View key={row.key} style={[styles.detailRow, index < detailRows.length - 1 && styles.detailRowDivider]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <View style={styles.trackerRow}>
            {steps.map((step, index) => (
              <React.Fragment key={step.label}>
                <View style={styles.trackerStep}>
                  <View style={[styles.trackerMarker, step.complete ? styles.trackerMarkerDone : styles.trackerMarkerPending]}>
                    {step.complete ? (
                      <Icon name="check" size={12} color={colors.white} strokeWidth={3} />
                    ) : (
                      <View style={styles.trackerMarkerDot} />
                    )}
                  </View>
                  <Text style={[styles.trackerLabel, step.complete && styles.trackerLabelDone]}>{step.label}</Text>
                </View>
                {index < steps.length - 1 ? (
                  <View style={[styles.trackerConnector, step.complete ? styles.trackerConnectorDone : null]} />
                ) : null}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Download Receipt"
          onPress={handleDownloadReceipt}
          icon={<Icon name="file-text" size={18} color={colors.white} />}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heroBlock: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.lg,
  },
  heroAmount: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 36,
    lineHeight: 54,
    color: colors.primary,
    paddingTop: spacing.xs,
  },
  heroDate: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  detailCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  statusCard: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  statusTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
  },
  trackerStep: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  trackerMarker: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerMarkerDone: {
    backgroundColor: colors.primary,
  },
  trackerMarkerPending: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
  },
  trackerMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  trackerLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  trackerLabelDone: {
    color: colors.primary,
    fontFamily: typography.tinyBold.fontFamily,
  },
  trackerConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: 11,
    marginHorizontal: spacing.xs,
  },
  trackerConnectorDone: {
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
