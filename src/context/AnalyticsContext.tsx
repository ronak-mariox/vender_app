import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export type TrendDirection = 'up' | 'down' | 'flat';
export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'custom';

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

type AnalyticsContextValue = {
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
  isLoading: boolean;
  revenueTrend: number[];
  kpiStats: KpiStat[];
  bestSellingProducts: RankedProduct[];
  lowPerformingProducts: LowPerformingProduct[];
  cancellationReasons: CancellationReason[];
  inventoryPerformance: InventoryPerformanceStat;
  refresh: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [kpiStats, setKpiStats] = useState<KpiStat[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<number[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<RankedProduct[]>([]);
  const [lowPerformingProducts, setLowPerformingProducts] = useState<LowPerformingProduct[]>([]);
  const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>([]);
  const [inventoryPerformance, setInventoryPerformance] = useState<InventoryPerformanceStat>(EMPTY_INVENTORY_PERFORMANCE);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overview, bestSelling, lowPerforming, cancellations, inventoryPerf] = await Promise.all([
        api.get<{ kpiStats: KpiStat[]; revenueTrend: number[] }>('/vendor/analytics/overview', { params: { period } }),
        api.get<RankedProduct[]>('/vendor/analytics/best-selling', { params: { period } }),
        api.get<LowPerformingProduct[]>('/vendor/analytics/low-performing', { params: { period } }),
        api.get<CancellationReason[]>('/vendor/analytics/cancellation-reasons', { params: { period } }),
        api.get<InventoryPerformanceStat>('/vendor/analytics/inventory-performance', { params: { period } }),
      ]);
      setKpiStats(overview.data.kpiStats);
      setRevenueTrend(overview.data.revenueTrend);
      setBestSellingProducts(bestSelling.data);
      setLowPerformingProducts(lowPerforming.data);
      setCancellationReasons(cancellations.data);
      setInventoryPerformance(inventoryPerf.data);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      period,
      setPeriod,
      isLoading,
      revenueTrend,
      kpiStats,
      bestSellingProducts,
      lowPerformingProducts,
      cancellationReasons,
      inventoryPerformance,
      refresh,
    }),
    [period, isLoading, revenueTrend, kpiStats, bestSellingProducts, lowPerformingProducts, cancellationReasons, inventoryPerformance, refresh],
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
