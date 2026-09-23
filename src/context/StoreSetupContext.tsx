import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export type StoreProfileData = {
  storeName: string;
  description: string;
  primaryCategory: string;
  subCategory: string;
  tags: string[];
  minimumOrderValue: string;
  avgPrepTime: string;
};

export type StoreLocationData = {
  address: string;
  cityState: string;
  latitude: number;
  longitude: number;
};

export type StoreAddressData = {
  buildingShopNo: string;
  street: string;
  landmark: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  contactNumber: string;
  sameAsBusinessAddress: boolean;
  location: StoreLocationData;
};

export type DaySchedule = {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
};

export type OperatingHoursData = {
  sameEveryDay: boolean;
  defaultOpen: string;
  defaultClose: string;
  breakEnabled: boolean;
  weeklySchedule: DaySchedule[];
};

export type HolidayClosureItem = {
  id: string;
  title: string;
  date: string;
  daysClosed: number;
  note: string;
};

export type FulfillmentType = 'delivery' | 'pickup' | 'both';

export type DeliverySlab = {
  id: string;
  range: string;
  charge: string;
};

export type DeliverySettingsData = {
  fulfillmentType: FulfillmentType;
  deliveryRadiusKm: number;
  minimumOrderForDelivery: string;
  chargeType: string;
  slabs: DeliverySlab[];
  freeDeliveryAbove: string;
};

export type DeliverySlot = {
  id: string;
  label: string;
  window: string;
  totalSlots: number;
  usedSlots: number;
};

export type ServiceAvailabilityData = {
  slotsEnabled: boolean;
  slots: DeliverySlot[];
  maxSimultaneousOrders: string;
  autoPauseAtCapacity: boolean;
};

export type StoreStatusValue = 'open' | 'closed' | 'temporarily-closed';

export type TempClosureData = {
  reason: string;
  customMessage: string;
  fromDate: string;
  toDate: string;
  closeFromTime: string;
  reopenAt: string;
  notifyCustomers: boolean;
};

type StoreSetupData = {
  profile?: StoreProfileData;
  logoUploaded?: boolean;
  logoUrl?: string;
  coverImageUploaded?: boolean;
  coverImageUrl?: string;
  address?: StoreAddressData;
  operatingHours?: OperatingHoursData;
  holidays: HolidayClosureItem[];
  delivery?: DeliverySettingsData;
  serviceAvailability?: ServiceAvailabilityData;
  storeStatus: StoreStatusValue;
  tempClosure?: TempClosureData;
  setupCompletedAt?: string | null;
};

type StoreSetupContextValue = {
  data: StoreSetupData;
  isLoading: boolean;
  refresh: () => Promise<void>;
  updateProfile: (value: StoreProfileData) => void;
  setLogoUploaded: (value: boolean, url?: string) => void;
  setCoverImageUploaded: (value: boolean, url?: string) => void;
  updateAddress: (value: StoreAddressData) => void;
  updateOperatingHours: (value: OperatingHoursData) => void;
  addHoliday: (value: HolidayClosureItem) => void;
  updateHoliday: (value: HolidayClosureItem) => void;
  removeHoliday: (id: string) => void;
  updateDelivery: (value: DeliverySettingsData) => void;
  updateServiceAvailability: (value: ServiceAvailabilityData) => void;
  setStoreStatus: (value: StoreStatusValue) => void;
  updateTempClosure: (value: TempClosureData) => void;
};

const StoreSetupContext = createContext<StoreSetupContextValue | null>(null);

const EMPTY_DATA: StoreSetupData = { holidays: [], storeStatus: 'open' };

// Shape returned by GET /vendor/store-setup (see backend's vendorStoreSetupController#getStoreSetup).
interface ApiStoreSetup {
  storeSetupStep: string;
  storeSetupCompletedAt: string | null;
  storeProfile: StoreProfileData | null;
  storeLogoUrl: string | null;
  storeCoverImageUrl: string | null;
  storeSetupAddress: StoreAddressData | null;
  operatingHours: OperatingHoursData | null;
  holidays: HolidayClosureItem[];
  deliverySettings: DeliverySettingsData | null;
  serviceAvailability: ServiceAvailabilityData | null;
  storeStatus: StoreStatusValue;
  tempClosure: TempClosureData | null;
}

function fromApi(api: ApiStoreSetup): StoreSetupData {
  return {
    profile: api.storeProfile ?? undefined,
    logoUploaded: Boolean(api.storeLogoUrl),
    logoUrl: api.storeLogoUrl ?? undefined,
    coverImageUploaded: Boolean(api.storeCoverImageUrl),
    coverImageUrl: api.storeCoverImageUrl ?? undefined,
    address: api.storeSetupAddress ?? undefined,
    operatingHours: api.operatingHours ?? undefined,
    holidays: api.holidays ?? [],
    delivery: api.deliverySettings ?? undefined,
    serviceAvailability: api.serviceAvailability ?? undefined,
    storeStatus: api.storeStatus,
    tempClosure: api.tempClosure ?? undefined,
    setupCompletedAt: api.storeSetupCompletedAt,
  };
}

export function StoreSetupProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreSetupData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // StoreSetupContext previously never talked to the backend at all — every field
  // (profile, logo/cover, address, hours, delivery, availability, status) only ever
  // held whatever was typed in the CURRENT app session, reset to empty on every app
  // restart. That's why the Dashboard's "Setup Checklist" and the empty/main/closed
  // view it picks always looked wrong: they read this context, which had no way of
  // knowing what was actually saved server-side. Hydrate from the real backend
  // instead, same pattern as ProductCatalogContext/RegistrationContext.
  const refresh = useCallback(async () => {
    try {
      const { data: remote } = await api.get<ApiStoreSetup>('/vendor/store-setup');
      setData(fromApi(remote));
    } catch {
      // Not yet an approved vendor (403), not authenticated yet (401), or offline —
      // in every case the right fallback is the empty local state, not an error.
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const updateProfile = useCallback((value: StoreProfileData) => {
    setData(prev => ({ ...prev, profile: value }));
  }, []);
  const setLogoUploaded = useCallback((value: boolean, url?: string) => {
    setData(prev => ({ ...prev, logoUploaded: value, logoUrl: url ?? prev.logoUrl }));
  }, []);
  const setCoverImageUploaded = useCallback((value: boolean, url?: string) => {
    setData(prev => ({ ...prev, coverImageUploaded: value, coverImageUrl: url ?? prev.coverImageUrl }));
  }, []);
  const updateAddress = useCallback((value: StoreAddressData) => {
    setData(prev => ({ ...prev, address: value }));
  }, []);
  const updateOperatingHours = useCallback((value: OperatingHoursData) => {
    setData(prev => ({ ...prev, operatingHours: value }));
  }, []);
  const addHoliday = useCallback((value: HolidayClosureItem) => {
    setData(prev => ({ ...prev, holidays: [...prev.holidays, value] }));
  }, []);
  const updateHoliday = useCallback((value: HolidayClosureItem) => {
    setData(prev => ({ ...prev, holidays: prev.holidays.map(item => (item.id === value.id ? value : item)) }));
  }, []);
  const removeHoliday = useCallback((id: string) => {
    setData(prev => ({ ...prev, holidays: prev.holidays.filter(item => item.id !== id) }));
  }, []);
  const updateDelivery = useCallback((value: DeliverySettingsData) => {
    setData(prev => ({ ...prev, delivery: value }));
  }, []);
  const updateServiceAvailability = useCallback((value: ServiceAvailabilityData) => {
    setData(prev => ({ ...prev, serviceAvailability: value }));
  }, []);
  const setStoreStatus = useCallback((value: StoreStatusValue) => {
    setData(prev => ({ ...prev, storeStatus: value }));
  }, []);
  const updateTempClosure = useCallback((value: TempClosureData) => {
    setData(prev => ({ ...prev, tempClosure: value }));
  }, []);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      refresh,
      updateProfile,
      setLogoUploaded,
      setCoverImageUploaded,
      updateAddress,
      updateOperatingHours,
      addHoliday,
      updateHoliday,
      removeHoliday,
      updateDelivery,
      updateServiceAvailability,
      setStoreStatus,
      updateTempClosure,
    }),
    [
      data,
      isLoading,
      refresh,
      updateProfile,
      setLogoUploaded,
      setCoverImageUploaded,
      updateAddress,
      updateOperatingHours,
      addHoliday,
      updateHoliday,
      removeHoliday,
      updateDelivery,
      updateServiceAvailability,
      setStoreStatus,
      updateTempClosure,
    ],
  );

  return <StoreSetupContext.Provider value={value}>{children}</StoreSetupContext.Provider>;
}

export function useStoreSetup() {
  const context = useContext(StoreSetupContext);
  if (!context) {
    throw new Error('useStoreSetup must be used within a StoreSetupProvider');
  }
  return context;
}
