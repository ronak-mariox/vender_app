import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ViewInvoice'>;

function formatINR(amount: number) {
  return `₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
}

export function ViewInvoiceScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Invoice" onBack={() => navigation.goBack()} />

      {!settlement ? (
        <View style={styles.notFound}>
          <Icon name="file-text" size={32} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>Invoice not found for this settlement.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.brand}>Verdant</Text>
                  <Text style={styles.brandSub}>Commerce Pvt. Ltd.</Text>
                </View>
                <View>
                  <Text style={styles.taxInvoice}>TAX INVOICE</Text>
                  <Text style={styles.invoiceNumber}>{settlement.id.replace('STL', 'INV')}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Date: {settlement.transactionDate ?? settlement.dueDateLabel ?? '—'}
                  </Text>
                  <Text style={styles.metaText}>Period: {settlement.dateRangeLabel}</Text>
                </View>

                <View style={styles.billedToBox}>
                  <Text style={styles.billedToLabel}>BILLED TO</Text>
                  <Text style={styles.billedToName}>Sharma Grocery Store</Text>
                  <Text style={styles.billedToGst}>GSTIN: 27AAACS0564Q1ZA</Text>
                </View>

                <View style={styles.lineItemsBox}>
                  <View style={[styles.lineItemRow, styles.lineItemDivider]}>
                    <Text style={styles.lineItemLabel}>Gross Sales</Text>
                    <Text style={styles.lineItemValue}>{formatINR(settlement.grossSales)}</Text>
                  </View>
                  <View style={[styles.lineItemRow, styles.lineItemDivider]}>
                    <Text style={styles.lineItemLabel}>Returns</Text>
                    <Text style={styles.lineItemValue}>-{formatINR(settlement.returns)}</Text>
                  </View>
                  <View style={[styles.lineItemRow, styles.lineItemDivider]}>
                    <Text style={styles.lineItemLabel}>
                      Platform Commission ({settlement.commissionRate}%)
                    </Text>
                    <Text style={styles.lineItemValue}>-{formatINR(settlement.commission)}</Text>
                  </View>
                  <View style={styles.lineItemRow}>
                    <Text style={styles.lineItemLabel}>GST on Commission (18%)</Text>
                    <Text style={styles.lineItemValue}>-{formatINR(settlement.gstOnCommission)}</Text>
                  </View>
                </View>

                <View style={styles.netPayoutRow}>
                  <Text style={styles.netPayoutLabel}>Net Payout</Text>
                  <Text style={styles.netPayoutValue}>{formatINR(settlement.netPayout)}</Text>
                </View>

                <View style={styles.qrWrap}>
                  <View style={styles.qrBox}>
                    <Text style={styles.qrText}>QR Code</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Download PDF"
              icon={<Icon name="file-text" size={18} color={colors.white} />}
              onPress={() => navigation.navigate('DownloadInvoice', { settlementId })}
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
  qrWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  qrBox: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    ...typography.tiny,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
