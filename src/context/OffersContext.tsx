import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'paused';
export type DiscountType = 'percentage' | 'flat';
export type OfferScope = 'selected-products' | 'entire-store';
export type CustomerEligibility = 'all' | 'new-only';

export type TopProduct = {
  name: string;
  unitsSold: number;
};

export type Offer = {
  id: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  status: OfferStatus;
  scope: OfferScope;
  categoryIds: string[];
  categoryLabel: string;
  productCount: number;
  minOrderValueEnabled: boolean;
  minOrderValue?: number;
  customerEligibility: CustomerEligibility;
  startDateLabel: string;
  endDateLabel: string;
  durationLabel: string;
  usesCount: number;
  usesToday?: number;
  revenueGenerated: number;
  revenueToday?: number;
  avgOrderValue?: number;
  estimatedReach?: number;
  topProduct?: TopProduct;
  runDaysLabel?: string;
};

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off-diwali-special',
    name: 'Diwali Special',
    discountType: 'percentage',
    discountValue: 20,
    status: 'active',
    scope: 'selected-products',
    categoryIds: ['dairy-eggs'],
    categoryLabel: 'Dairy & Eggs',
    productCount: 48,
    minOrderValueEnabled: false,
    customerEligibility: 'all',
    startDateLabel: '9 Nov',
    endDateLabel: '15 Nov',
    durationLabel: '9–15 Nov 2024 · 6 days',
    usesCount: 847,
    usesToday: 28,
    revenueGenerated: 24810,
    revenueToday: 5340,
    avgOrderValue: 246,
    estimatedReach: 320,
  },
  {
    id: 'off-weekend-fresh',
    name: 'Weekend Fresh',
    discountType: 'flat',
    discountValue: 30,
    status: 'scheduled',
    scope: 'entire-store',
    categoryIds: [],
    categoryLabel: 'Entire Store',
    productCount: 229,
    minOrderValueEnabled: true,
    minOrderValue: 299,
    customerEligibility: 'all',
    startDateLabel: '9 Nov',
    endDateLabel: '16 Nov',
    durationLabel: '9–16 Nov 2024 · 7 days',
    usesCount: 0,
    revenueGenerated: 0,
  },
  {
    id: 'off-monsoon-fest',
    name: 'Monsoon Fest',
    discountType: 'percentage',
    discountValue: 15,
    status: 'expired',
    scope: 'entire-store',
    categoryIds: [],
    categoryLabel: 'Entire Store',
    productCount: 229,
    minOrderValueEnabled: false,
    customerEligibility: 'all',
    startDateLabel: '30 Jul',
    endDateLabel: '30 Sep',
    durationLabel: '30 Jul–30 Sep 2024 · 62 days',
    usesCount: 1243,
    revenueGenerated: 38520,
    topProduct: { name: 'Tropicana 1L', unitsSold: 234 },
    runDaysLabel: 'Previous offer ran for 62 days with consistent daily usage.',
  },
];

type OffersContextValue = {
  offers: Offer[];
  getOffer: (offerId: string) => Offer | undefined;
  addOffer: (offer: Offer) => void;
  pauseOffer: (offerId: string) => void;
  resumeOffer: (offerId: string) => void;
  deleteOffer: (offerId: string) => void;
  duplicateOffer: (offerId: string) => Offer;
};

const OffersContext = createContext<OffersContextValue | null>(null);

export function OffersProvider({ children }: { children: React.ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);

  const getOffer = useCallback((offerId: string) => offers.find(offer => offer.id === offerId), [offers]);

  const addOffer = useCallback((offer: Offer) => {
    setOffers(prev => [offer, ...prev]);
  }, []);

  const pauseOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.map(offer => (offer.id === offerId ? { ...offer, status: 'paused' } : offer)));
  }, []);

  const resumeOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.map(offer => (offer.id === offerId ? { ...offer, status: 'active' } : offer)));
  }, []);

  const deleteOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
  }, []);

  const duplicateOffer = useCallback(
    (offerId: string) => {
      const source = offers.find(offer => offer.id === offerId);
      const clone: Offer = source
        ? {
            ...source,
            id: `off-${Date.now()}`,
            name: `${source.name} (Copy)`,
            status: 'scheduled',
            usesCount: 0,
            usesToday: undefined,
            revenueGenerated: 0,
            revenueToday: undefined,
            topProduct: undefined,
          }
        : {
            id: `off-${Date.now()}`,
            name: 'New Offer',
            discountType: 'percentage',
            discountValue: 10,
            status: 'scheduled',
            scope: 'entire-store',
            categoryIds: [],
            categoryLabel: 'Entire Store',
            productCount: 0,
            minOrderValueEnabled: false,
            customerEligibility: 'all',
            startDateLabel: '',
            endDateLabel: '',
            durationLabel: '',
            usesCount: 0,
            revenueGenerated: 0,
          };
      setOffers(prev => [clone, ...prev]);
      return clone;
    },
    [offers],
  );

  const value = useMemo(
    () => ({ offers, getOffer, addOffer, pauseOffer, resumeOffer, deleteOffer, duplicateOffer }),
    [offers, getOffer, addOffer, pauseOffer, resumeOffer, deleteOffer, duplicateOffer],
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
