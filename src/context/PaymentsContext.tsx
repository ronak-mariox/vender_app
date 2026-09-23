import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export type SettlementStatus = 'paid' | 'pending' | 'failed';

export type WeeklyBreakdownRow = {
  label: string;
  sales: number;
  amount: number;
};

export type Settlement = {
  id: string;
  dateRangeLabel: string;
  status: SettlementStatus;
  grossSales: number;
  returns: number;
  netSales: number;
  commissionRate: number;
  commission: number;
  gstOnCommission: number;
  adjustments: number;
  netPayout: number;
  bankAccountLabel?: string;
  transactionRef?: string;
  transactionDate?: string;
  dueDateLabel?: string;
  failureReason?: string;
  // Raw ISO bounds of the settlement period, for real date math that doesn't
  // need to re-parse `dateRangeLabel`.
  periodStart?: string;
  periodEnd?: string;
};

type PayoutBatch = {
  id: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  returns: number;
  netSales: number;
  commissionRate: number;
  commission: number;
  gstOnCommission: number;
  adjustments: number;
  netPayout: number;
  status: SettlementStatus;
  bankAccountLabel?: string;
  transactionRef?: string;
  transactionDate?: string;
  failureReason?: string;
};

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `dateRangeLabel` must stay in this exact "D–D Mon YYYY" shape — it's what
 * SettlementHistoryScreen's parseSettlementDate() regex-parses for grouping. */
function formatDateRangeLabel(periodStartIso: string, periodEndIso: string): string {
  const start = new Date(periodStartIso);
  const end = new Date(periodEndIso);
  end.setDate(end.getDate() - 1); // periodEnd is the exclusive next-Monday boundary
  return `${start.getDate()}–${end.getDate()} ${MONTH_ABBR[end.getMonth()]} ${end.getFullYear()}`;
}

function formatTransactionDate(iso: string): string {
  const d = new Date(iso);
  const hours24 = d.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}, ${hours12}:${minutes} ${ampm}`;
}

function mapBatchToSettlement(batch: PayoutBatch): Settlement {
  return {
    id: batch.id,
    dateRangeLabel: formatDateRangeLabel(batch.periodStart, batch.periodEnd),
    status: batch.status,
    grossSales: batch.grossSales,
    returns: batch.returns,
    netSales: batch.netSales,
    // Backend stores commissionRate as a fraction (e.g. 0.08); screens display it as "8%".
    commissionRate: Math.round(batch.commissionRate * 1000) / 10,
    commission: batch.commission,
    gstOnCommission: batch.gstOnCommission,
    adjustments: batch.adjustments,
    netPayout: batch.netPayout,
    bankAccountLabel: batch.bankAccountLabel,
    transactionRef: batch.transactionRef,
    transactionDate: batch.transactionDate ? formatTransactionDate(batch.transactionDate) : undefined,
    // No due-date concept exists on the backend (bank transfer timing isn't tracked
    // in-app) — left undefined rather than fabricated; consuming screens already
    // fall back to "No dues" / hide the due-date line when this is absent.
    dueDateLabel: undefined,
    failureReason: batch.failureReason,
    periodStart: batch.periodStart,
    periodEnd: batch.periodEnd,
  };
}

type PaymentsContextValue = {
  settlements: Settlement[];
  isLoading: boolean;
  getSettlement: (settlementId: string) => Settlement | undefined;
  weeklyCommission: WeeklyBreakdownRow[];
  weeklyTaxes: WeeklyBreakdownRow[];
  weeklyAdjustments: WeeklyBreakdownRow[];
  retrySettlement: (settlementId: string) => void;
  refresh: () => Promise<void>;
};

const PaymentsContext = createContext<PaymentsContextValue | null>(null);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<PayoutBatch[]>('/vendor/me/payments/batches');
      setSettlements(data.map(mapBatchToSettlement));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const getSettlement = useCallback(
    (settlementId: string) => settlements.find(settlement => settlement.id === settlementId),
    [settlements],
  );

  // Only an admin can actually resolve a failed/pending batch (bank transfers happen
  // outside the app) — retrying here means re-syncing with the backend, not
  // fabricating a local status change.
  const retrySettlement = useCallback(
    (_settlementId: string) => {
      refresh().catch(() => {});
    },
    [refresh],
  );

  const chronological = useMemo(
    () => [...settlements].sort((a, b) => (a.periodStart ?? '').localeCompare(b.periodStart ?? '')),
    [settlements],
  );

  const weeklyCommission = useMemo<WeeklyBreakdownRow[]>(
    () => chronological.map((s, index) => ({ label: `Week ${index + 1}`, sales: s.grossSales, amount: s.commission })),
    [chronological],
  );
  const weeklyTaxes = useMemo<WeeklyBreakdownRow[]>(
    () => chronological.map((s, index) => ({ label: `Week ${index + 1}`, sales: s.commission, amount: s.gstOnCommission })),
    [chronological],
  );
  const weeklyAdjustments = useMemo<WeeklyBreakdownRow[]>(
    () => chronological.map((s, index) => ({ label: `Week ${index + 1}`, sales: s.grossSales, amount: s.adjustments })),
    [chronological],
  );

  const value = useMemo<PaymentsContextValue>(
    () => ({
      settlements,
      isLoading,
      getSettlement,
      weeklyCommission,
      weeklyTaxes,
      weeklyAdjustments,
      retrySettlement,
      refresh,
    }),
    [settlements, isLoading, getSettlement, weeklyCommission, weeklyTaxes, weeklyAdjustments, retrySettlement, refresh],
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
