import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

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
  verified: boolean;
  businessName: string;
  registrationDate: string;
  category: string;
  /** Uploaded GST certificate URL, returned by POST /vendor/registration/documents. */
  certificateUrl: string;
};

export type PanDetailsData = {
  panNumber: string;
  verified: boolean;
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
  verified: boolean;
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
  referenceId?: string;
};

type RegistrationContextValue = {
  data: RegistrationData;
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
  const [data, setData] = useState<RegistrationData>({});

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
  const reset = useCallback(() => setData({}), []);

  const value = useMemo(
    () => ({
      data,
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
