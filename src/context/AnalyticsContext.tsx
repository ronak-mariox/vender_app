import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

export type TrendDirection = 'up' | 'down' | 'flat';
export type AnalyticsPeriod = 'today' | 'week' | 'month';

/** Backend windows are trailing (week = last 7 days, month = last 30 days). */
export const ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: 'Today',
  week: 'Last 7 Days',
  month: 'Last 30 Days',
};

export type KpiStat = {
  key: 'revenue' | 'orders' | 'avgOrder' | 'cancelled';
  label: string;
  value: string;
  changeLabel: string;
  direction: TrendDirection;
  sparkline: number[];
};

export type RankedProduct = {
  name: string;
  revenue: number;
  units: number;
  orders: number;
  trend: TrendDirection;
};

export type LowPerformingProduct = {
  name: string;
  unitsSold: number;
  revenue: number;
  daysSinceLastSale: number | null;
  stock: number;
  suggestion: string;
};

export type CancellationReason = {
  reason: string;
  count: number;
  percent: number;
};

export type InventoryPerformanceStat = {
  turnoverRate: number;
  avgDaysToSellOut: number | null;
  stockoutIncidents: number;
  deadStockValue: number;
  deadStockCount: number;
};

const EMPTY_INVENTORY_PERFORMANCE: InventoryPerformanceStat = {
  turnoverRate: 0,
  avgDaysToSellOut: null,
  stockoutIncidents: 0,
  deadStockValue: 0,
  deadStockCount: 0,
};

/** Numeric value of a KPI card (the backend sends display strings like "₹1,234"). */
export function kpiNumber(stats: KpiStat[], key: KpiStat['key']): number {
  const raw = stats.find(stat => stat.key === key)?.value ?? '';
  const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

type OverviewResponse = { kpiStats?: KpiStat[]; revenueTrend?: number[]; revenueDates?: string[] };

type AnalyticsContextValue = {
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
  periodLabel: string;
  isLoading: boolean;
  error: string | null;
  revenueTrend: number[];
  /** `YYYY-MM-DD` per point, aligned with `revenueTrend` and every KPI sparkline. */
  revenueDates: string[];
  kpiStats: KpiStat[];
  bestSellingProducts: RankedProduct[];
  lowPerformingProducts: LowPerformingProduct[];
  cancellationReasons: CancellationReason[];
  inventoryPerformance: InventoryPerformanceStat;
  refresh: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpiStats, setKpiStats] = useState<KpiStat[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<number[]>([]);
  const [revenueDates, setRevenueDates] = useState<string[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<RankedProduct[]>([]);
  const [lowPerformingProducts, setLowPerformingProducts] = useState<LowPerformingProduct[]>([]);
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>([]);
  const [inventoryPerformance, setInventoryPerformance] = useState<InventoryPerformanceStat>(EMPTY_INVENTORY_PERFORMANCE);
  const requestSeq = useRef(0);

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current;
    setIsLoading(true);
    try {
      const params = { params: { period } };
      const [overview, bestSelling, lowPerforming, cancellations, inventoryPerf] = await Promise.all([
        api.get<OverviewResponse>('/vendor/analytics/overview', params),
        api.get('/vendor/analytics/best-selling', params),
        api.get('/vendor/analytics/low-performing', params),
        api.get('/vendor/analytics/cancellation-reasons', params),
        api.get<InventoryPerformanceStat>('/vendor/analytics/inventory-performance', params),
      ]);
      if (seq !== requestSeq.current) return;
      setKpiStats(overview.data.kpiStats ?? []);
      setRevenueTrend(overview.data.revenueTrend ?? []);
      setRevenueDates(overview.data.revenueDates ?? []);
      setBestSellingProducts(unwrapList<RankedProduct>(bestSelling.data));
      setLowPerformingProducts(unwrapList<LowPerformingProduct>(lowPerforming.data));
      setCancellationReasons(unwrapList<CancellationReason>(cancellations.data));
      setInventoryPerformance({ ...EMPTY_INVENTORY_PERFORMANCE, ...inventoryPerf.data });
      setError(null);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(getApiErrorMessage(err, 'Could not load analytics.'));
    } finally {
      if (seq === requestSeq.current) setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!vendorId) {
      requestSeq.current += 1;
      setKpiStats([]);
      setRevenueTrend([]);
      setRevenueDates([]);
      setBestSellingProducts([]);
      setLowPerformingProducts([]);
      setCancellationReasons([]);
      setInventoryPerformance(EMPTY_INVENTORY_PERFORMANCE);
      setError(null);
      setIsLoading(false);
      return;
    }
    refresh();
  }, [vendorId, refresh]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      period,
      setPeriod,
      periodLabel: ANALYTICS_PERIOD_LABELS[period],
      isLoading,
      error,
      revenueTrend,
      revenueDates,
      kpiStats,
      bestSellingProducts,
      lowPerformingProducts,
      cancellationReasons,
      inventoryPerformance,
      refresh,
    }),
    [period, isLoading, error, revenueTrend, revenueDates, kpiStats, bestSellingProducts, lowPerformingProducts, cancellationReasons, inventoryPerformance, refresh],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
