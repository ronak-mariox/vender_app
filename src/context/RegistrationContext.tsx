import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { useVendorAuth } from './VendorAuthContext';

export type BusinessTypeValue =
  | 'individual'
  | 'proprietorship'
  | 'partnership'
  | 'private-limited'
  | 'other';

export type BusinessInfoData = {
  legalName: string;
  displayName: string;
  category: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

export type OwnerInfoData = {
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  pan: string;
};

export type StoreLocationData = {
  address: string;
  cityState: string;
  latitude: number;
  longitude: number;
};

export type StoreInfoData = {
  storeName: string;
  storeAddress: string;
  landmark: string;
  contactNumber: string;
  storeType: string;
  operatingHours: string;
  location: StoreLocationData;
};

export type GstDetailsData = {
  registered: boolean;
  gstin: string;
  businessName: string;
  registrationDate: string;
  category: string;
  /** Uploaded GST certificate URL, returned by POST /vendor/registration/documents. */
  certificateUrl: string;
};

export type PanDetailsData = {
  panNumber: string;
  holderName: string;
  dob: string;
  panType: string;
  /** Uploaded PAN document URL, returned by POST /vendor/registration/documents. */
  documentUrl: string;
};

export type BusinessProofData = {
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  /** Uploaded front/back document URLs, returned by POST /vendor/registration/documents. */
  frontUrl: string;
  backUrl: string;
};

export type BankDetailsData = {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
  accountType: string;
};

type RegistrationData = {
  businessType?: BusinessTypeValue;
  businessInfo?: BusinessInfoData;
  ownerInfo?: OwnerInfoData;
  storeInfo?: StoreInfoData;
  gstDetails?: GstDetailsData;
  panDetails?: PanDetailsData;
  businessProof?: BusinessProofData;
  bankDetails?: BankDetailsData;
  /** Location picked on StoreLocation before the Store Info step is saved. */
  storeLocation?: StoreLocationData;
  referenceId?: string;
};

type RemoteRegistration = {
  businessType?: BusinessTypeValue | null;
  businessInfo?: Partial<BusinessInfoData> | null;
  ownerInfo?: Partial<OwnerInfoData> | null;
  storeInfo?: (Partial<Omit<StoreInfoData, 'location'>> & { location?: Partial<StoreLocationData> }) | null;
  gstDetails?: Partial<GstDetailsData> | null;
  panDetails?: Partial<PanDetailsData> | null;
  businessProof?: Partial<BusinessProofData> | null;
  bankDetails?: Partial<BankDetailsData> | null;
  referenceId?: string | null;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function isoDate(value: unknown): string {
  const raw = str(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function num(value: unknown): number {
  const parsed = typeof value === 'number' ? value : parseFloat(str(value));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function toLocation(remote: Partial<StoreLocationData> | undefined): StoreLocationData | undefined {
  if (!remote) return undefined;
  const latitude = num(remote.latitude);
  const longitude = num(remote.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return undefined;
  return { address: str(remote.address), cityState: str(remote.cityState), latitude, longitude };
}

function fromRemote(remote: RemoteRegistration, prev: RegistrationData): RegistrationData {
  const next: RegistrationData = { ...prev };
  if (remote.businessType) next.businessType = remote.businessType;
  if (remote.businessInfo) {
    const b = remote.businessInfo;
    next.businessInfo = {
      legalName: str(b.legalName),
      displayName: str(b.displayName),
      category: str(b.category),
      addressLine1: str(b.addressLine1),
      addressLine2: str(b.addressLine2),
      city: str(b.city),
      state: str(b.state),
      pincode: str(b.pincode),
    };
  }
  if (remote.ownerInfo) {
    const o = remote.ownerInfo;
    next.ownerInfo = {
      fullName: str(o.fullName),
      mobile: str(o.mobile),
      email: str(o.email),
      dob: isoDate(o.dob),
      pan: str(o.pan),
    };
  }
  if (remote.storeInfo) {
    const si = remote.storeInfo;
    const location = toLocation(si.location);
    if (location) {
      next.storeInfo = {
        storeName: str(si.storeName),
        storeAddress: str(si.storeAddress),
        landmark: str(si.landmark),
        contactNumber: str(si.contactNumber),
        storeType: str(si.storeType),
        operatingHours: str(si.operatingHours),
        location,
      };
      next.storeLocation = prev.storeLocation ?? location;
    }
  }
  if (remote.gstDetails) {
    const g = remote.gstDetails;
    next.gstDetails = {
      registered: g.registered !== false,
      gstin: str(g.gstin),
      businessName: str(g.businessName),
      registrationDate: isoDate(g.registrationDate),
      category: str(g.category),
      certificateUrl: str(g.certificateUrl),
    };
  }
  if (remote.panDetails) {
    const p = remote.panDetails;
    next.panDetails = {
      panNumber: str(p.panNumber),
      holderName: str(p.holderName),
      dob: isoDate(p.dob),
      panType: str(p.panType),
      documentUrl: str(p.documentUrl),
    };
  }
  if (remote.businessProof) {
    const bp = remote.businessProof;
    next.businessProof = {
      documentType: str(bp.documentType),
      documentNumber: str(bp.documentNumber),
      issueDate: isoDate(bp.issueDate),
      expiryDate: isoDate(bp.expiryDate),
      frontUrl: str(bp.frontUrl),
      backUrl: str(bp.backUrl),
    };
  }
  if (remote.bankDetails) {
    const bd = remote.bankDetails;
    next.bankDetails = {
      accountHolderName: str(bd.accountHolderName),
      accountNumber: str(bd.accountNumber),
      ifsc: str(bd.ifsc),
      bankName: str(bd.bankName),
      branch: str(bd.branch),
      accountType: str(bd.accountType),
    };
  }
  if (remote.referenceId) next.referenceId = remote.referenceId;
  return next;
}

type RegistrationContextValue = {
  data: RegistrationData;
  /** True once the server copy of the registration has been loaded at least once for this vendor. */
  hydrated: boolean;
  refresh: () => Promise<void>;
  updateStoreLocation: (value: StoreLocationData) => void;
  updateBusinessType: (value: BusinessTypeValue) => void;
  updateBusinessInfo: (value: BusinessInfoData) => void;
  updateOwnerInfo: (value: OwnerInfoData) => void;
  updateStoreInfo: (value: StoreInfoData) => void;
  updateGstDetails: (value: GstDetailsData) => void;
  updatePanDetails: (value: PanDetailsData) => void;
  updateBusinessProof: (value: BusinessProofData) => void;
  updateBankDetails: (value: BankDetailsData) => void;
  setReferenceId: (referenceId: string) => void;
  reset: () => void;
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const { vendor } = useVendorAuth();
  const vendorId = vendor?.id ?? null;
  const [data, setData] = useState<RegistrationData>({});
  const [hydrated, setHydrated] = useState(false);
  const lastVendorId = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const { data: remote } = await api.get<RemoteRegistration>('/vendor/registration');
    setData(prev => fromRemote(remote, prev));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!vendorId) {
      lastVendorId.current = null;
      setData({});
      setHydrated(false);
      return;
    }
    // Keep a seed written for the vendor that just signed up (CreateAccount writes
    // ownerInfo before this effect runs); only a different vendor wipes local data.
    if (lastVendorId.current && lastVendorId.current !== vendorId) {
      setData({});
      setHydrated(false);
    }
    lastVendorId.current = vendorId;
    refresh().catch(() => undefined);
  }, [vendorId, refresh]);

  const updateStoreLocation = useCallback((value: StoreLocationData) => {
    setData(prev => ({ ...prev, storeLocation: value }));
  }, []);

  const updateBusinessType = useCallback((value: BusinessTypeValue) => {
    setData(prev => ({ ...prev, businessType: value }));
  }, []);
  const updateBusinessInfo = useCallback((value: BusinessInfoData) => {
    setData(prev => ({ ...prev, businessInfo: value }));
  }, []);
  const updateOwnerInfo = useCallback((value: OwnerInfoData) => {
    setData(prev => ({ ...prev, ownerInfo: value }));
  }, []);
  const updateStoreInfo = useCallback((value: StoreInfoData) => {
    setData(prev => ({ ...prev, storeInfo: value }));
  }, []);
  const updateGstDetails = useCallback((value: GstDetailsData) => {
    setData(prev => ({ ...prev, gstDetails: value }));
  }, []);
  const updatePanDetails = useCallback((value: PanDetailsData) => {
    setData(prev => ({ ...prev, panDetails: value }));
  }, []);
  const updateBusinessProof = useCallback((value: BusinessProofData) => {
    setData(prev => ({ ...prev, businessProof: value }));
  }, []);
  const updateBankDetails = useCallback((value: BankDetailsData) => {
    setData(prev => ({ ...prev, bankDetails: value }));
  }, []);
  const setReferenceId = useCallback((referenceId: string) => {
    setData(prev => ({ ...prev, referenceId }));
  }, []);
  const reset = useCallback(() => {
    setData({});
    setHydrated(false);
  }, []);

  const value = useMemo(
    () => ({
      data,
      hydrated,
      refresh,
      updateStoreLocation,
      updateBusinessType,
      updateBusinessInfo,
      updateOwnerInfo,
      updateStoreInfo,
      updateGstDetails,
      updatePanDetails,
      updateBusinessProof,
      updateBankDetails,
      setReferenceId,
      reset,
    }),
    [
      data,
      hydrated,
      refresh,
      updateStoreLocation,
      updateBusinessType,
      updateBusinessInfo,
      updateOwnerInfo,
      updateStoreInfo,
      updateGstDetails,
      updatePanDetails,
      updateBusinessProof,
      updateBankDetails,
      setReferenceId,
      reset,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}
