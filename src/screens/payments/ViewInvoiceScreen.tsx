import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiErrorMessage } from '../../services/api';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import { buildInvoiceText, formatINRExact, formatSignedINRExact, settlementBreakdown } from './settlementHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'ViewInvoice'>;

export function ViewInvoiceScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement, fetchSettlement } = usePayments();
  const { profile } = useProfile();
  const settlement = getSettlement(settlementId);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (settlement) return;
    let cancelled = false;
    fetchSettlement(settlementId).catch(err => {
      if (!cancelled) setLoadError(getApiErrorMessage(err, 'Invoice not found for this settlement.'));
    });
    return () => {
      cancelled = true;
    };
  }, [settlement, settlementId, fetchSettlement]);

  async function handleShare() {
    if (!settlement) return;
    try {
      await Share.share({ title: settlement.invoiceNumber, message: buildInvoiceText(settlement, profile) });
    } catch (err) {
      Alert.alert('Could not share invoice', err instanceof Error ? err.message : 'Please try again.');
    }
  }

  const vendorName = profile.vendor.legalName || profile.storeName;
  const breakdownRows = settlement ? settlementBreakdown(settlement) : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Invoice" onBack={() => navigation.goBack()} />

      {!settlement ? (
        <View style={styles.notFound}>
          {loadError ? (
            <>
              <Icon name="file-text" size={32} color={colors.textTertiary} />
              <Text style={styles.notFoundText}>{loadError}</Text>
            </>
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.brand}>Verdant</Text>
                  <Text style={styles.brandSub}>Settlement {settlement.shortRef}</Text>
                </View>
                <View>
                  <Text style={styles.taxInvoice}>INVOICE</Text>
                  <Text style={styles.invoiceNumber}>{settlement.invoiceNumber}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Period: {settlement.dateRangeLabel}</Text>
                  {settlement.transactionDateLabel ? (
                    <Text style={styles.metaText}>Paid: {settlement.transactionDateLabel}</Text>
                  ) : null}
                </View>

                <View style={styles.billedToBox}>
                  <Text style={styles.billedToLabel}>BILLED TO</Text>
                  <Text style={styles.billedToName}>{vendorName}</Text>
                  {profile.vendor.gstNumber ? (
                    <Text style={styles.billedToGst}>GSTIN: {profile.vendor.gstNumber}</Text>
                  ) : null}
                  {profile.vendor.registeredAddress ? (
                    <Text style={styles.billedToGst}>{profile.vendor.registeredAddress}</Text>
                  ) : null}
                </View>

                <View style={styles.lineItemsBox}>
                  {breakdownRows.map((row, index) => (
                    <View
                      key={row.key}
                      style={[styles.lineItemRow, index < breakdownRows.length - 1 && styles.lineItemDivider]}
                    >
                      <Text style={styles.lineItemLabel}>{row.label}</Text>
                      <Text style={styles.lineItemValue}>{formatSignedINRExact(row.amount)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.netPayoutRow}>
                  <Text style={styles.netPayoutLabel}>Net Payout</Text>
                  <Text style={styles.netPayoutValue}>{formatINRExact(settlement.netPayout)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Share Invoice"
              icon={<Icon name="share" size={18} color={colors.white} />}
              onPress={handleShare}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  brand: {
    fontFamily: typography.h3.fontFamily,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: -0.3,
    color: colors.white,
  },
  brandSub: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.7)',
    paddingTop: 2,
  },
  taxInvoice: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'right',
  },
  invoiceNumber: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    paddingTop: 2,
  },
  cardBody: {
    padding: spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  billedToBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: 2,
  },
  billedToLabel: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  billedToName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  billedToGst: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lineItemsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + spacing.xs,
  },
  lineItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineItemLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  lineItemValue: {
    ...typography.captionSemibold,
    fontFamily: typography.body.fontFamily,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  netPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  netPayoutLabel: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.primary,
  },
  netPayoutValue: {
    ...typography.bodySemibold,
    fontWeight: '800',
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
