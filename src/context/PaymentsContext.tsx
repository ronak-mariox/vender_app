import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { GST_ON_FEE_PERCENT_LABEL, PLATFORM_FEE_PERCENT_LABEL, PLATFORM_FEE_RATE } from '../constants/fees';
import { useVendorAuth } from './VendorAuthContext';

export type SettlementStatus = 'paid' | 'pending' | 'failed';

export type PaymentsPeriod = 'week' | 'month' | 'quarter' | 'all';

export const PAYMENTS_PERIOD_LABELS: Record<PaymentsPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'Last 3 Months',
  all: 'All Time',
};

export type Settlement = {
  id: string;
  /** Last 8 chars of the batch id, uppercased — the human-facing reference. */
  shortRef: string;
  invoiceNumber: string;
  dateRangeLabel: string;
  periodStart: string;
  periodEnd: string;
  status: SettlementStatus;
  grossSales: number;
  returns: number;
  netSales: number;
  /** Fraction, e.g. 0.08. */
  commissionRate: number;
  commissionRateLabel: string;
  gstRateLabel: string;
  commission: number;
  gstOnCommission: number;
  adjustments: number;
  netPayout: number;
  settlementCount: number;
  bankAccountLabel?: string;
  transactionRef?: string;
  transactionDate?: string;
  transactionDateLabel?: string;
  failureReason?: string;
};

type PayoutBatch = {
  id: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  returns?: number;
  netSales: number;
  commissionRate: number;
  commission: number;
  gstOnCommission: number;
  adjustments?: number;
  netPayout: number;
  settlementCount?: number;
  status: SettlementStatus;
  bankAccountLabel?: string;
  transactionRef?: string;
  transactionDate?: string;
  failureReason?: string;
};

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortRefOf(id: string): string {
  return id.slice(-8).toUpperCase();
}

function formatDateRangeLabel(periodStartIso: string, periodEndIso: string): string {
  const start = new Date(periodStartIso);
  const end = new Date(periodEndIso);
  end.setDate(end.getDate() - 1); // periodEnd is the exclusive next-Monday boundary
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_ABBR[end.getMonth()]} ${end.getFullYear()}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = `${start.getDate()} ${MONTH_ABBR[start.getMonth()]}${sameYear ? '' : ` ${start.getFullYear()}`}`;
  return `${startLabel} – ${end.getDate()} ${MONTH_ABBR[end.getMonth()]} ${end.getFullYear()}`;
}

function formatTransactionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}, ${hours12}:${minutes} ${ampm}`;
}

function formatRateLabel(rate: number): string {
  if (Math.abs(rate - PLATFORM_FEE_RATE) < 1e-9) return PLATFORM_FEE_PERCENT_LABEL;
  return `${Math.round(rate * 1000) / 10}%`;
}

function mapBatchToSettlement(batch: PayoutBatch): Settlement {
  const shortRef = shortRefOf(batch.id);
  return {
    id: batch.id,
    shortRef,
    invoiceNumber: `INV-${shortRef}`,
    dateRangeLabel: formatDateRangeLabel(batch.periodStart, batch.periodEnd),
    periodStart: batch.periodStart,
    periodEnd: batch.periodEnd,
    status: batch.status,
    grossSales: batch.grossSales,
    returns: batch.returns ?? 0,
    netSales: batch.netSales,
    commissionRate: batch.commissionRate,
    commissionRateLabel: formatRateLabel(batch.commissionRate),
    gstRateLabel: GST_ON_FEE_PERCENT_LABEL,
    commission: batch.commission,
    gstOnCommission: batch.gstOnCommission,
    adjustments: batch.adjustments ?? 0,
    netPayout: batch.netPayout,
    settlementCount: batch.settlementCount ?? 0,
    bankAccountLabel: batch.bankAccountLabel || undefined,
    transactionRef: batch.transactionRef || undefined,
    transactionDate: batch.transactionDate || undefined,
    transactionDateLabel: batch.transactionDate ? formatTransactionDate(batch.transactionDate) || undefined : undefined,
    failureReason: batch.failureReason || undefined,
  };
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function periodWindow(period: PaymentsPeriod, now: Date): { from: Date; to: Date } | null {
  if (period === 'all') return null;
  if (period === 'week') {
    const from = startOfWeek(now);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { from, to };
  }
  const monthsBack = period === 'month' ? 0 : 2;
  const from = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from, to };
}

/** A weekly batch belongs to a period when any part of its Mon–Sun window overlaps it. */
export function filterSettlementsByPeriod(settlements: Settlement[], period: PaymentsPeriod, now = new Date()): Settlement[] {
  const window = periodWindow(period, now);
  if (!window) return settlements;
  return settlements.filter(s => {
    const start = new Date(s.periodStart).getTime();
    const end = new Date(s.periodEnd).getTime();
    return start < window.to.getTime() && end > window.from.getTime();
  });
}

type PaymentsContextValue = {
  settlements: Settlement[];
  filteredSettlements: Settlement[];
  period: PaymentsPeriod;
  setPeriod: (period: PaymentsPeriod) => void;
  periodLabel: string;
  isLoading: boolean;
  error: string | null;
  getSettlement: (settlementId: string) => Settlement | undefined;
  fetchSettlement: (settlementId: string) => Promise<Settlement | undefined>;
  refresh: () => Promise<void>;
};

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [period, setPeriod] = useState<PaymentsPeriod>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current;
    setIsLoading(true);
    try {
      const { data } = await api.get('/vendor/me/payments/batches');
      if (seq !== requestSeq.current) return;
      setSettlements(unwrapList<PayoutBatch>(data).map(mapBatchToSettlement));
      setError(null);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(getApiErrorMessage(err, 'Could not load settlements.'));
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vendorId) {
      requestSeq.current += 1;
      setSettlements([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    refresh();
  }, [vendorId, refresh]);

  const getSettlement = useCallback(
    (settlementId: string) => settlements.find(settlement => settlement.id === settlementId),
    [settlements],
  );

  const fetchSettlement = useCallback(async (settlementId: string) => {
    const { data } = await api.get<PayoutBatch>(`/vendor/me/payments/batches/${settlementId}`);
    const settlement = mapBatchToSettlement(data);
    setSettlements(prev => {
      const index = prev.findIndex(s => s.id === settlement.id);
      if (index === -1) {
        return [...prev, settlement].sort((a, b) => b.periodStart.localeCompare(a.periodStart));
      }
      const next = [...prev];
      next[index] = settlement;
      return next;
    });
    return settlement;
  }, []);

  const filteredSettlements = useMemo(() => filterSettlementsByPeriod(settlements, period), [settlements, period]);

  const value = useMemo<PaymentsContextValue>(
    () => ({
      settlements,
      filteredSettlements,
      period,
      setPeriod,
      periodLabel: PAYMENTS_PERIOD_LABELS[period],
      isLoading,
      error,
      getSettlement,
      fetchSettlement,
      refresh,
    }),
    [settlements, filteredSettlements, period, isLoading, error, getSettlement, fetchSettlement, refresh],
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
}
