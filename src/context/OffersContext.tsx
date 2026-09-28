import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getApiErrorMessage, unwrapList } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'paused';
export type DiscountType = 'percentage' | 'flat';
export type OfferScope = 'selected-products' | 'entire-store';
export type CustomerEligibility = 'all' | 'new-only';

/** An offer as returned by `GET /vendor/offers` (`status` is derived server-side). */
export type Offer = {
  id: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  scope: OfferScope;
  productIds: string[];
  categoryIds: string[];
  minOrderValueEnabled: boolean;
  minOrderValue: number;
  customerEligibility: CustomerEligibility;
  startDate: string;
  endDate: string;
  isPaused: boolean;
  usesCount: number;
  revenueGenerated: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
};

/** Body accepted by `POST /vendor/offers` and `PATCH /vendor/offers/:id`. */
export type OfferInput = {
  title: string;
  discountType: DiscountType;
  discountValue: number;
  scope: OfferScope;
  productIds: string[];
  categoryIds: string[];
  minOrderValueEnabled: boolean;
  minOrderValue: number;
  customerEligibility: CustomerEligibility;
  startDate: string;
  endDate: string;
};

type ApiOffer = Partial<Offer> & { id?: string; _id?: string };

function deriveStatus(offer: { isPaused?: boolean; startDate?: string; endDate?: string }): OfferStatus {
  const now = Date.now();
  const end = offer.endDate ? new Date(offer.endDate).getTime() : Number.NaN;
  const start = offer.startDate ? new Date(offer.startDate).getTime() : Number.NaN;
  if (!Number.isNaN(end) && end < now) return 'expired';
  if (offer.isPaused) return 'paused';
  if (!Number.isNaN(start) && start > now) return 'scheduled';
  return 'active';
}

function mapOffer(raw: ApiOffer): Offer {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    title: raw.title ?? '',
    discountType: raw.discountType === 'flat' ? 'flat' : 'percentage',
    discountValue: Number(raw.discountValue) || 0,
    scope: raw.scope === 'entire-store' ? 'entire-store' : 'selected-products',
    productIds: (raw.productIds ?? []).map(String),
    categoryIds: (raw.categoryIds ?? []).map(String),
    minOrderValueEnabled: Boolean(raw.minOrderValueEnabled),
    minOrderValue: Number(raw.minOrderValue) || 0,
    customerEligibility: raw.customerEligibility === 'new-only' ? 'new-only' : 'all',
    startDate: raw.startDate ?? '',
    endDate: raw.endDate ?? '',
    isPaused: Boolean(raw.isPaused),
    usesCount: Number(raw.usesCount) || 0,
    revenueGenerated: Number(raw.revenueGenerated) || 0,
    status: raw.status ?? deriveStatus(raw),
    createdAt: raw.createdAt ?? '',
    updatedAt: raw.updatedAt ?? '',
  };
}

type OffersContextValue = {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchOffer: (offerId: string) => Promise<Offer>;
  getOffer: (offerId: string) => Offer | undefined;
  isOfferPending: (offerId: string) => boolean;
  createOffer: (input: OfferInput) => Promise<Offer>;
  updateOffer: (offerId: string, input: OfferInput) => Promise<Offer>;
  pauseOffer: (offerId: string) => Promise<Offer>;
  resumeOffer: (offerId: string) => Promise<Offer>;
  deleteOffer: (offerId: string) => Promise<void>;
};

const OffersContext = createContext<OffersContextValue | null>(null);

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, true>>({});

  const loadOffers = useCallback(async () => {
    const { data } = await api.get('/vendor/offers');
    setOffers(unwrapList<ApiOffer>(data).map(mapOffer));
    setError(null);
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setOffers([]);
      setPendingIds({});
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadOffers()
      .catch(err => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId, loadOffers]);

  const refresh = useCallback(async () => {
    try {
      await loadOffers();
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    }
  }, [loadOffers]);

  const merge = useCallback((offer: Offer) => {
    setOffers(prev => {
      const exists = prev.some(item => item.id === offer.id);
      return exists ? prev.map(item => (item.id === offer.id ? offer : item)) : [offer, ...prev];
    });
    return offer;
  }, []);

  const fetchOffer = useCallback(
    async (offerId: string) => {
      const { data } = await api.get<ApiOffer>(`/vendor/offers/${offerId}`);
      return merge(mapOffer(data));
    },
    [merge],
  );

  const getOffer = useCallback((offerId: string) => offers.find(offer => offer.id === offerId), [offers]);

  const isOfferPending = useCallback((offerId: string) => Boolean(pendingIds[offerId]), [pendingIds]);

  const withPending = useCallback(async <T,>(offerId: string, action: () => Promise<T>): Promise<T> => {
    setPendingIds(prev => ({ ...prev, [offerId]: true }));
    try {
      return await action();
    } finally {
      setPendingIds(prev => {
        const next = { ...prev };
        delete next[offerId];
        return next;
      });
    }
  }, []);

  const createOffer = useCallback(
    async (input: OfferInput) => {
      const { data } = await api.post<ApiOffer>('/vendor/offers', input);
      return merge(mapOffer(data));
    },
    [merge],
  );

  const updateOffer = useCallback(
    (offerId: string, input: OfferInput) =>
      withPending(offerId, async () => {
        const { data } = await api.patch<ApiOffer>(`/vendor/offers/${offerId}`, input);
        return merge(mapOffer(data));
      }),
    [merge, withPending],
  );

  const pauseOffer = useCallback(
    (offerId: string) =>
      withPending(offerId, async () => {
        const { data } = await api.patch<ApiOffer>(`/vendor/offers/${offerId}/pause`);
        return merge(mapOffer(data));
      }),
    [merge, withPending],
  );

  const resumeOffer = useCallback(
    (offerId: string) =>
      withPending(offerId, async () => {
        const { data } = await api.patch<ApiOffer>(`/vendor/offers/${offerId}/resume`);
        return merge(mapOffer(data));
      }),
    [merge, withPending],
  );

  const deleteOffer = useCallback(
    (offerId: string) =>
      withPending(offerId, async () => {
        await api.delete(`/vendor/offers/${offerId}`);
        setOffers(prev => prev.filter(offer => offer.id !== offerId));
      }),
    [withPending],
  );

  const value = useMemo(
    () => ({
      offers,
      loading,
      error,
      refresh,
      fetchOffer,
      getOffer,
      isOfferPending,
      createOffer,
      updateOffer,
      pauseOffer,
      resumeOffer,
      deleteOffer,
    }),
    [
      offers,
      loading,
      error,
      refresh,
      fetchOffer,
      getOffer,
      isOfferPending,
      createOffer,
      updateOffer,
      pauseOffer,
      resumeOffer,
      deleteOffer,
    ],
  );

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
}
