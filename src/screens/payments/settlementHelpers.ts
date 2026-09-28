import type { Settlement, SettlementStatus } from '../../context/PaymentsContext';
import type { ProfileCore } from '../../context/ProfileContext';
import { GST_ON_FEE_PERCENT_LABEL } from '../../constants/fees';
import { colors } from '../../theme';

export const SETTLEMENT_STATUS_META: Record<SettlementStatus, { label: string; background: string; text: string }> = {
  paid: { label: 'Paid', background: colors.primarySurface, text: colors.primary },
  pending: { label: 'Pending', background: colors.warningSurface, text: colors.warningDark },
  failed: { label: 'Failed', background: colors.errorSurface, text: colors.error },
};

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatINRExact(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatSignedINRExact(amount: number): string {
  return `${amount < 0 ? '-' : ''}${formatINRExact(amount)}`;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function sumBy(settlements: Settlement[], pick: (s: Settlement) => number): number {
  return round2(settlements.reduce((sum, s) => sum + pick(s), 0));
}

export type BreakdownRow = { key: string; label: string; amount: number };

/** Signed rows that always add up to `settlement.netPayout` (a rounding row absorbs paise drift). */
export function settlementBreakdown(settlement: Settlement): BreakdownRow[] {
  const rows: BreakdownRow[] = [{ key: 'gross', label: 'Gross Sales', amount: settlement.grossSales }];
  if (settlement.returns) rows.push({ key: 'returns', label: 'Returns', amount: -settlement.returns });
  rows.push({
    key: 'commission',
    label: `Platform Commission (${settlement.commissionRateLabel})`,
    amount: -settlement.commission,
  });
  rows.push({
    key: 'gst',
    label: `GST on Commission (${settlement.gstRateLabel || GST_ON_FEE_PERCENT_LABEL})`,
    amount: -settlement.gstOnCommission,
  });
  if (settlement.adjustments) rows.push({ key: 'adjustments', label: 'Adjustments', amount: settlement.adjustments });
  const drift = round2(settlement.netPayout - rows.reduce((sum, row) => sum + row.amount, 0));
  if (drift !== 0) rows.push({ key: 'rounding', label: 'Rounding', amount: drift });
  return rows;
}

export function buildInvoiceText(settlement: Settlement, profile: ProfileCore): string {
  const vendorName = profile.vendor.legalName || profile.storeName;
  const lines = [
    `Verdant — Settlement Invoice ${settlement.invoiceNumber}`,
    `Settlement: ${settlement.shortRef} (${SETTLEMENT_STATUS_META[settlement.status].label})`,
    `Period: ${settlement.dateRangeLabel}`,
    settlement.transactionDateLabel ? `Paid on: ${settlement.transactionDateLabel}` : null,
    '',
    `Billed to: ${vendorName}`,
    profile.vendor.gstNumber ? `GSTIN: ${profile.vendor.gstNumber}` : null,
    profile.vendor.registeredAddress ? `Address: ${profile.vendor.registeredAddress}` : null,
    '',
    ...settlementBreakdown(settlement).map(row => `${row.label}: ${formatSignedINRExact(row.amount)}`),
    `Net Payout: ${formatINRExact(settlement.netPayout)}`,
    `Orders settled: ${settlement.settlementCount}`,
    settlement.bankAccountLabel ? `Bank account: ${settlement.bankAccountLabel}` : null,
    settlement.transactionRef ? `Transaction ref: ${settlement.transactionRef}` : null,
  ];
  return lines.filter((line): line is string => line !== null).join('\n');
}
