import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CustomerEligibility, DiscountType, Offer, OfferScope, useOffers } from './OffersContext';

export type OfferTypeData = {
  name: string;
  discountType: DiscountType;
};

export type OfferProductsData = {
  scope: OfferScope;
  categoryIds: string[];
  categoryLabel: string;
  productCount: number;
};

export type OfferConditionsData = {
  applyOn: OfferScope;
  minOrderValueEnabled: boolean;
  minOrderValue?: number;
  customerEligibility: CustomerEligibility;
};

export type OfferDiscountValueData = {
  value: number;
};

export type OfferDateData = {
  dateLabel: string;
  time?: string;
  immediate?: boolean;
};

type OfferDraft = {
  type?: OfferTypeData;
  products?: OfferProductsData;
  conditions: OfferConditionsData;
  discountValue: OfferDiscountValueData;
  startDate?: OfferDateData;
  endDate?: OfferDateData;
  reviewConfirmed: boolean;
};

const INITIAL_DRAFT: OfferDraft = {
  conditions: {
    applyOn: 'selected-products',
    minOrderValueEnabled: false,
    customerEligibility: 'all',
  },
  discountValue: { value: 20 },
  reviewConfirmed: false,
};

type OfferDraftContextValue = {
  draft: OfferDraft;
  updateType: (value: OfferTypeData) => void;
  updateProducts: (value: OfferProductsData) => void;
  updateConditions: (value: OfferConditionsData) => void;
  updateDiscountValue: (value: OfferDiscountValueData) => void;
  updateStartDate: (value: OfferDateData) => void;
  updateEndDate: (value: OfferDateData) => void;
  setReviewConfirmed: (value: boolean) => void;
  resetDraft: () => void;
  computedDurationLabel: () => string;
  publishDraft: () => Offer;
};

const OfferDraftContext = createContext<OfferDraftContextValue | null>(null);

export function OfferDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OfferDraft>(INITIAL_DRAFT);
  const { addOffer } = useOffers();

  const updateType = useCallback((value: OfferTypeData) => {
    setDraft(prev => ({ ...prev, type: value }));
  }, []);
  const updateProducts = useCallback((value: OfferProductsData) => {
    setDraft(prev => ({ ...prev, products: value }));
  }, []);
  const updateConditions = useCallback((value: OfferConditionsData) => {
    setDraft(prev => ({ ...prev, conditions: value }));
  }, []);
  const updateDiscountValue = useCallback((value: OfferDiscountValueData) => {
    setDraft(prev => ({ ...prev, discountValue: value }));
  }, []);
  const updateStartDate = useCallback((value: OfferDateData) => {
    setDraft(prev => ({ ...prev, startDate: value }));
  }, []);
  const updateEndDate = useCallback((value: OfferDateData) => {
    setDraft(prev => ({ ...prev, endDate: value }));
  }, []);
  const setReviewConfirmed = useCallback((value: boolean) => {
    setDraft(prev => ({ ...prev, reviewConfirmed: value }));
  }, []);
  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  const computedDurationLabel = useCallback(() => {
    if (!draft.startDate || !draft.endDate) return '';
    return `${draft.startDate.dateLabel} – ${draft.endDate.dateLabel}`;
  }, [draft.startDate, draft.endDate]);

  const publishDraft = useCallback(() => {
    const offer: Offer = {
      id: `off-${Date.now()}`,
      name: draft.type?.name || 'Untitled Offer',
      discountType: draft.type?.discountType ?? 'percentage',
      discountValue: draft.discountValue.value,
      status: draft.startDate?.immediate ? 'active' : 'scheduled',
      scope: draft.products?.scope ?? draft.conditions.applyOn,
      categoryIds: draft.products?.categoryIds ?? [],
      categoryLabel: draft.products?.categoryLabel ?? 'Entire Store',
      productCount: draft.products?.productCount ?? 0,
      minOrderValueEnabled: draft.conditions.minOrderValueEnabled,
      minOrderValue: draft.conditions.minOrderValue,
      customerEligibility: draft.conditions.customerEligibility,
      startDateLabel: draft.startDate?.dateLabel ?? '',
      endDateLabel: draft.endDate?.dateLabel ?? '',
      durationLabel: computedDurationLabel(),
      usesCount: 0,
      revenueGenerated: 0,
    };
    addOffer(offer);
    return offer;
  }, [draft, addOffer, computedDurationLabel]);

  const value = useMemo(
    () => ({
      draft,
      updateType,
      updateProducts,
      updateConditions,
      updateDiscountValue,
      updateStartDate,
      updateEndDate,
      setReviewConfirmed,
      resetDraft,
      computedDurationLabel,
      publishDraft,
    }),
    [
      draft,
      updateType,
      updateProducts,
      updateConditions,
      updateDiscountValue,
      updateStartDate,
      updateEndDate,
      setReviewConfirmed,
      resetDraft,
      computedDurationLabel,
      publishDraft,
    ],
  );

  return <OfferDraftContext.Provider value={value}>{children}</OfferDraftContext.Provider>;
}

export function useOfferDraft() {
  const context = useContext(OfferDraftContext);
  if (!context) {
    throw new Error('useOfferDraft must be used within an OfferDraftProvider');
  }
  return context;
}
