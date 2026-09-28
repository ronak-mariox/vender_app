import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CustomerEligibility, DiscountType, Offer, OfferInput, OfferScope, useOffers } from './OffersContext';

export type OfferTypeData = {
  title: string;
  discountType: DiscountType;
};

export type OfferProductsData = {
  scope: OfferScope;
  productIds: string[];
  categoryIds: string[];
};

export type OfferConditionsData = {
  minOrderValueEnabled: boolean;
  minOrderValue: number;
  customerEligibility: CustomerEligibility;
};

export type OfferDraft = {
  /** Set when the wizard is editing an existing offer (publishes as PATCH). */
  editingOfferId: string | null;
  title: string;
  discountType: DiscountType;
  scope: OfferScope;
  productIds: string[];
  categoryIds: string[];
  minOrderValueEnabled: boolean;
  minOrderValue: number;
  customerEligibility: CustomerEligibility;
  discountValue: number;
  /** ISO timestamps; null until the vendor picks them. */
  startDate: string | null;
  startImmediately: boolean;
  endDate: string | null;
  reviewConfirmed: boolean;
};

export type OfferDraftErrors = Partial<
  Record<'title' | 'discountValue' | 'products' | 'minOrderValue' | 'startDate' | 'endDate', string>
>;

const INITIAL_DRAFT: OfferDraft = {
  editingOfferId: null,
  title: '',
  discountType: 'percentage',
  scope: 'selected-products',
  productIds: [],
  categoryIds: [],
  minOrderValueEnabled: false,
  minOrderValue: 0,
  customerEligibility: 'all',
  discountValue: 20,
  startDate: null,
  startImmediately: false,
  endDate: null,
  reviewConfirmed: false,
};

export function validateOfferDraft(draft: OfferDraft): OfferDraftErrors {
  const errors: OfferDraftErrors = {};
  if (!draft.title.trim()) errors.title = 'Enter an offer name';
  if (!(draft.discountValue > 0)) {
    errors.discountValue = 'Discount value must be greater than 0';
  } else if (draft.discountType === 'percentage' && draft.discountValue > 100) {
    errors.discountValue = 'Percentage discount cannot exceed 100%';
  }
  if (draft.scope === 'selected-products' && draft.productIds.length === 0 && draft.categoryIds.length === 0) {
    errors.products = 'Select at least one product or category';
  }
  if (draft.minOrderValueEnabled && !(draft.minOrderValue > 0)) {
    errors.minOrderValue = 'Enter a minimum order value';
  }
  const start = draft.startImmediately ? Date.now() : draft.startDate ? new Date(draft.startDate).getTime() : Number.NaN;
  const end = draft.endDate ? new Date(draft.endDate).getTime() : Number.NaN;
  if (Number.isNaN(start)) errors.startDate = 'Choose a start date';
  if (Number.isNaN(end)) {
    errors.endDate = 'Choose an end date';
  } else if (!Number.isNaN(start) && end < start) {
    errors.endDate = 'End date must be on or after the start date';
  }
  return errors;
}

export function draftToOfferInput(draft: OfferDraft): OfferInput {
  const entireStore = draft.scope === 'entire-store';
  return {
    title: draft.title.trim(),
    discountType: draft.discountType,
    discountValue: draft.discountValue,
    scope: draft.scope,
    productIds: entireStore ? [] : draft.productIds,
    categoryIds: entireStore ? [] : draft.categoryIds,
    minOrderValueEnabled: draft.minOrderValueEnabled,
    minOrderValue: draft.minOrderValueEnabled ? draft.minOrderValue : 0,
    customerEligibility: draft.customerEligibility,
    startDate: draft.startImmediately ? new Date().toISOString() : draft.startDate ?? '',
    endDate: draft.endDate ?? '',
  };
}

type OfferDraftContextValue = {
  draft: OfferDraft;
  updateType: (value: OfferTypeData) => void;
  updateProducts: (value: OfferProductsData) => void;
  updateConditions: (value: OfferConditionsData) => void;
  updateDiscountValue: (value: number) => void;
  updateStartDate: (value: { startDate: string | null; startImmediately: boolean }) => void;
  updateEndDate: (value: string | null) => void;
  setReviewConfirmed: (value: boolean) => void;
  resetDraft: () => void;
  /** Seeds the wizard from an existing offer — pass its id to edit it in place, or null to duplicate. */
  loadFromOffer: (offer: Offer, editingOfferId: string | null) => void;
  validate: () => OfferDraftErrors;
  publishDraft: () => Promise<Offer>;
};

const OfferDraftContext = createContext<OfferDraftContextValue | null>(null);

export function OfferDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OfferDraft>(INITIAL_DRAFT);
  const { createOffer, updateOffer } = useOffers();

  const updateType = useCallback((value: OfferTypeData) => {
    setDraft(prev => ({ ...prev, ...value }));
  }, []);
  const updateProducts = useCallback((value: OfferProductsData) => {
    setDraft(prev => ({ ...prev, ...value }));
  }, []);
  const updateConditions = useCallback((value: OfferConditionsData) => {
    setDraft(prev => ({ ...prev, ...value }));
  }, []);
  const updateDiscountValue = useCallback((value: number) => {
    setDraft(prev => ({ ...prev, discountValue: value }));
  }, []);
  const updateStartDate = useCallback((value: { startDate: string | null; startImmediately: boolean }) => {
    setDraft(prev => ({ ...prev, ...value }));
  }, []);
  const updateEndDate = useCallback((value: string | null) => {
    setDraft(prev => ({ ...prev, endDate: value }));
  }, []);
  const setReviewConfirmed = useCallback((value: boolean) => {
    setDraft(prev => ({ ...prev, reviewConfirmed: value }));
  }, []);
  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  const loadFromOffer = useCallback((offer: Offer, editingOfferId: string | null) => {
    setDraft({
      editingOfferId,
      title: editingOfferId ? offer.title : `${offer.title} (Copy)`,
      discountType: offer.discountType,
      scope: offer.scope,
      productIds: offer.productIds,
      categoryIds: offer.categoryIds,
      minOrderValueEnabled: offer.minOrderValueEnabled,
      minOrderValue: offer.minOrderValue,
      customerEligibility: offer.customerEligibility,
      discountValue: offer.discountValue,
      startDate: editingOfferId ? offer.startDate : null,
      startImmediately: false,
      endDate: editingOfferId ? offer.endDate : null,
      reviewConfirmed: false,
    });
  }, []);

  const validate = useCallback(() => validateOfferDraft(draft), [draft]);

  const publishDraft = useCallback(async () => {
    const errors = validateOfferDraft(draft);
    const firstError = Object.values(errors)[0];
    if (firstError) throw new Error(firstError);
    const input = draftToOfferInput(draft);
    return draft.editingOfferId ? updateOffer(draft.editingOfferId, input) : createOffer(input);
  }, [draft, createOffer, updateOffer]);

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
      loadFromOffer,
      validate,
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
      loadFromOffer,
      validate,
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
