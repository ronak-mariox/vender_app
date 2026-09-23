import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { pickAndUploadLogo, pickAndUploadCoverImage } from '../services/storeSetupUpload';

export type VendorStats = {
  orders: number;
  revenue: number;
  rating: number;
};

export type VendorInfo = {
  businessType: string;
  legalName: string;
  gstNumber: string;
  gstBusinessName: string;
  gstRegistrationDate: string;
  panNumber: string;
  panHolderName: string;
  panDob: string;
  registeredAddress: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

export type OwnerInfo = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
};

export type StoreInfo = {
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  storeCode: string;
  onboardedLabel: string;
  contactNumber: string;
  minimumOrderValue: number | null;
  avgPrepTime: number | null;
  logoUrl: string;
  coverImageUrl: string;
};

export type ProfileCore = {
  storeName: string;
  vendorCode: string;
  avatarInitials: string;
  status: string;
  kycVerified: boolean;
  stats: VendorStats;
  vendor: VendorInfo;
  owner: OwnerInfo;
  store: StoreInfo;
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  isPrimary: boolean;
  lat: number | null;
  lng: number | null;
};

export type DocumentStatus = 'verified' | 'pending' | 'rejected';

export type ProfileDocument = {
  id: string;
  name: string;
  status: DocumentStatus;
  uploadedLabel: string;
  rejectionReason?: string;
  url?: string;
};

export type AdditionalDocument = {
  id: string;
  name: string;
  url: string;
  uploadedLabel: string;
};

export type BankDetails = {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
  accountType: string;
  upiId: string;
};

export type BankDetailsRequestStatus = 'pending' | 'approved' | 'rejected' | null;

export type Settlement = {
  id: string;
  orderNumber: string;
  grossAmount: number;
  commissionAmount: number;
  netPayout: number;
  settledAt: string;
};

export type NotificationPrefGroup = 'Orders' | 'Inventory' | 'Payments' | 'System';

export type NotificationPref = {
  key: string;
  label: string;
  description: string;
  group: NotificationPrefGroup;
  locked: boolean;
  enabled: boolean;
};

// Labels/descriptions/grouping are fixed product copy (nothing to persist per
// vendor beyond the on/off flag) — only `enabled` comes from the backend.
const NOTIFICATION_PREF_DEFS: Omit<NotificationPref, 'enabled'>[] = [
  { key: 'new-order', label: 'New Order', description: 'Alert when a new order arrives', group: 'Orders', locked: true },
  { key: 'order-updates', label: 'Order Updates', description: 'Status changes for active orders', group: 'Orders', locked: true },
  { key: 'order-cancelled', label: 'Order Cancelled', description: 'When an order is cancelled', group: 'Orders', locked: true },
  { key: 'low-stock', label: 'Low Stock Alerts', description: 'When stock falls below threshold', group: 'Inventory', locked: false },
  { key: 'out-of-stock', label: 'Out of Stock', description: 'Item goes out of stock', group: 'Inventory', locked: false },
  { key: 'restock-reminders', label: 'Restock Reminders', description: 'Scheduled restock suggestions', group: 'Inventory', locked: false },
  { key: 'settlement-credited', label: 'Settlement Credited', description: 'Weekly settlement deposited', group: 'Payments', locked: false },
  { key: 'payment-received', label: 'Payment Received', description: 'Customer payment confirmation', group: 'Payments', locked: false },
  { key: 'deductions', label: 'Deductions', description: 'Commission and fee deductions', group: 'Payments', locked: false },
  { key: 'app-updates', label: 'App Updates', description: 'New app version available', group: 'System', locked: false },
  { key: 'policy-changes', label: 'Policy Changes', description: 'Terms and policy updates', group: 'System', locked: false },
  { key: 'marketing', label: 'Marketing', description: 'Promotions and offers from Verdant', group: 'System', locked: false },
];
const DEFAULT_ENABLED_KEYS = new Set(
  NOTIFICATION_PREF_DEFS.filter((d) => d.locked || d.key !== 'restock-reminders' && d.key !== 'deductions' && d.key !== 'marketing').map((d) => d.key),
);

// ---------------------------------------------------------------------------
// Backend shapes (only the fields this context actually reads/writes)
// ---------------------------------------------------------------------------

interface StepReview {
  status: DocumentStatus;
  note?: string;
}

interface RawAdditionalDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface RawPendingBankDetails {
  data: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
    bankName?: string;
    branch?: string;
    accountType: string;
    upiId?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewNote?: string;
  reviewedAt?: string;
}

interface RawVendor {
  phone: string;
  email?: string;
  fullName?: string;
  status: string;
  kycStatus: string;
  referenceId?: string;
  businessType?: string;
  businessInfo?: {
    legalName?: string;
    displayName?: string;
    category?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  ownerInfo?: { fullName?: string; mobile?: string; email?: string; dob?: string; pan?: string };
  storeInfo?: {
    storeName?: string;
    storeAddress?: string;
    landmark?: string;
    contactNumber?: string;
    storeType?: string;
    operatingHours?: string;
  };
  gstDetails?: {
    registered?: boolean;
    gstin?: string;
    businessName?: string;
    registrationDate?: string;
    category?: string;
    certificateUrl?: string;
  };
  panDetails?: { panNumber?: string; holderName?: string; dob?: string; panType?: string; documentUrl?: string };
  businessProof?: { documentType?: string; frontUrl?: string };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    branch?: string;
    accountType?: string;
    upiId?: string;
  };
  stepReviews?: Partial<Record<string, StepReview>>;
  storeProfile?: {
    storeName?: string;
    description?: string;
    primaryCategory?: string;
    subCategory?: string;
    tags?: string[];
    minimumOrderValue?: number;
    avgPrepTime?: number;
  };
  storeLogoUrl?: string;
  storeCoverImageUrl?: string;
  additionalDocuments?: RawAdditionalDocument[];
  pendingBankDetails?: RawPendingBankDetails;
  createdAt: string;
}

interface RawStats {
  orders: number;
  revenue: number;
  rating: number | null;
}

interface RawAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  isPrimary: boolean;
  lat?: number;
  lng?: number;
}

interface RawSettlement {
  id: string;
  orderNumber: string;
  grossAmount: number;
  commissionAmount: number;
  netPayout: number;
  settledAt: string;
}

function initialsOf(name?: string): string {
  if (!name) return '—';
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '—';
}

function formatAddress(info?: RawVendor['businessInfo']): string {
  if (!info) return '';
  return [info.addressLine1, info.addressLine2, info.city, info.state, info.pincode].filter(Boolean).join(', ');
}

function formatOnboardedLabel(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toProfileCore(vendor: RawVendor, stats: RawStats): ProfileCore {
  return {
    storeName: vendor.storeProfile?.storeName || vendor.businessInfo?.legalName || vendor.fullName || 'Your Store',
    vendorCode: vendor.referenceId ?? '—',
    avatarInitials: initialsOf(vendor.ownerInfo?.fullName || vendor.fullName),
    status: vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1),
    kycVerified: vendor.kycStatus === 'verified',
    stats: { orders: stats.orders, revenue: stats.revenue, rating: stats.rating ?? 0 },
    vendor: {
      businessType: vendor.businessType ?? '',
      legalName: vendor.businessInfo?.legalName ?? '',
      gstNumber: vendor.gstDetails?.gstin ?? '',
      gstBusinessName: vendor.gstDetails?.businessName ?? '',
      gstRegistrationDate: vendor.gstDetails?.registrationDate ?? '',
      panNumber: vendor.panDetails?.panNumber ?? '',
      panHolderName: vendor.panDetails?.holderName ?? '',
      panDob: vendor.panDetails?.dob ?? '',
      registeredAddress: formatAddress(vendor.businessInfo),
      addressLine1: vendor.businessInfo?.addressLine1 ?? '',
      addressLine2: vendor.businessInfo?.addressLine2 ?? '',
      city: vendor.businessInfo?.city ?? '',
      state: vendor.businessInfo?.state ?? '',
      pincode: vendor.businessInfo?.pincode ?? '',
    },
    owner: {
      name: vendor.ownerInfo?.fullName || vendor.fullName || '',
      phone: vendor.ownerInfo?.mobile || vendor.phone,
      email: vendor.ownerInfo?.email || vendor.email || '',
      dateOfBirth: vendor.ownerInfo?.dob ?? '',
    },
    store: {
      category: vendor.storeProfile?.primaryCategory || vendor.storeInfo?.storeType || '',
      subCategory: vendor.storeProfile?.subCategory ?? '',
      tags: vendor.storeProfile?.tags ?? [],
      description: vendor.storeProfile?.description ?? '',
      storeCode: vendor.referenceId ?? '—',
      onboardedLabel: formatOnboardedLabel(vendor.createdAt),
      contactNumber: vendor.storeInfo?.contactNumber ?? '',
      minimumOrderValue: vendor.storeProfile?.minimumOrderValue ?? null,
      avgPrepTime: vendor.storeProfile?.avgPrepTime ?? null,
      logoUrl: vendor.storeLogoUrl ?? '',
      coverImageUrl: vendor.storeCoverImageUrl ?? '',
    },
  };
}

function stepStatus(vendor: RawVendor, key: string): DocumentStatus {
  const status = vendor.stepReviews?.[key]?.status;
  return status === 'verified' || status === 'rejected' ? status : 'pending';
}

function toDocuments(vendor: RawVendor): ProfileDocument[] {
  const docs: ProfileDocument[] = [];
  if (vendor.panDetails) {
    docs.push({
      id: 'panDetails',
      name: 'PAN Card',
      status: stepStatus(vendor, 'panDetails'),
      uploadedLabel: 'Submitted during registration',
      rejectionReason: vendor.stepReviews?.panDetails?.note,
      url: vendor.panDetails.documentUrl,
    });
  }
  if (vendor.gstDetails?.registered) {
    docs.push({
      id: 'gstDetails',
      name: 'GST Certificate',
      status: stepStatus(vendor, 'gstDetails'),
      uploadedLabel: 'Submitted during registration',
      rejectionReason: vendor.stepReviews?.gstDetails?.note,
      url: vendor.gstDetails.certificateUrl,
    });
  }
  if (vendor.businessProof) {
    docs.push({
      id: 'businessProof',
      name: vendor.businessProof.documentType || 'Business Proof',
      status: stepStatus(vendor, 'businessProof'),
      uploadedLabel: 'Submitted during registration',
      rejectionReason: vendor.stepReviews?.businessProof?.note,
      url: vendor.businessProof.frontUrl,
    });
  }
  if (vendor.bankDetails) {
    docs.push({
      id: 'bankDetails',
      name: 'Bank Details',
      status: stepStatus(vendor, 'bankDetails'),
      uploadedLabel: 'Submitted during registration',
      rejectionReason: vendor.stepReviews?.bankDetails?.note,
    });
  }
  return docs;
}

function toAdditionalDocument(raw: RawAdditionalDocument): AdditionalDocument {
  return { id: raw.id, name: raw.name, url: raw.url, uploadedLabel: formatOnboardedLabel(raw.uploadedAt) };
}

function toBankDetails(vendor: RawVendor): BankDetails {
  const accountNumber = vendor.bankDetails?.accountNumber;
  return {
    accountHolderName: vendor.bankDetails?.accountHolderName ?? '',
    // Masked for display — the edit screen always collects a fresh full number
    // rather than pre-filling from this value, so masking here is safe.
    accountNumber: accountNumber ? `****${accountNumber.slice(-4)}` : '',
    ifsc: vendor.bankDetails?.ifsc ?? '',
    bankName: vendor.bankDetails?.bankName ?? '',
    branch: vendor.bankDetails?.branch ?? '',
    accountType: vendor.bankDetails?.accountType ?? '',
    upiId: vendor.bankDetails?.upiId ?? '',
  };
}

function toAddress(raw: RawAddress): Address {
  return {
    id: raw.id,
    label: raw.label,
    line1: raw.line1,
    line2: raw.line2 ?? '',
    isPrimary: raw.isPrimary,
    lat: raw.lat ?? null,
    lng: raw.lng ?? null,
  };
}

function toSettlement(raw: RawSettlement): Settlement {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    grossAmount: raw.grossAmount,
    commissionAmount: raw.commissionAmount,
    netPayout: raw.netPayout,
    settledAt: raw.settledAt,
  };
}

const EMPTY_PROFILE: ProfileCore = {
  storeName: '',
  vendorCode: '—',
  avatarInitials: '—',
  status: '',
  kycVerified: false,
  stats: { orders: 0, revenue: 0, rating: 0 },
  vendor: {
    businessType: '',
    legalName: '',
    gstNumber: '',
    gstBusinessName: '',
    gstRegistrationDate: '',
    panNumber: '',
    panHolderName: '',
    panDob: '',
    registeredAddress: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  },
  owner: { name: '', phone: '', email: '', dateOfBirth: '' },
  store: {
    category: '',
    subCategory: '',
    tags: [],
    description: '',
    storeCode: '—',
    onboardedLabel: '—',
    contactNumber: '',
    minimumOrderValue: null,
    avgPrepTime: null,
    logoUrl: '',
    coverImageUrl: '',
  },
};

const EMPTY_BANK: BankDetails = {
  accountHolderName: '',
  accountNumber: '',
  ifsc: '',
  bankName: '',
  branch: '',
  accountType: '',
  upiId: '',
};

type ProfileContextValue = {
  isLoading: boolean;
  profile: ProfileCore;
  updateVendorInfo: (value: Partial<VendorInfo>) => Promise<void>;
  updateOwnerInfo: (value: Partial<OwnerInfo>) => Promise<void>;
  updateStoreInfo: (value: Partial<StoreInfo>) => Promise<void>;
  updateProfileBasics: (value: { storeName?: string; avatarInitials?: string }) => Promise<void>;
  updateStoreLogo: (source: 'camera' | 'gallery') => Promise<void>;
  updateStoreCover: (source: 'camera' | 'gallery') => Promise<void>;

  addresses: Address[];
  getAddress: (addressId: string) => Address | undefined;
  addAddress: (address: { label: string; line1: string; line2?: string; lat?: number; lng?: number }) => Promise<void>;
  updateAddress: (addressId: string, value: Partial<Address>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setPrimaryAddress: (addressId: string) => Promise<void>;

  documents: ProfileDocument[];
  getDocument: (documentId: string) => ProfileDocument | undefined;
  replaceDocument: (documentId: string, url: string) => Promise<void>;

  additionalDocuments: AdditionalDocument[];
  addAdditionalDocument: (name: string, url: string) => Promise<void>;
  removeAdditionalDocument: (documentId: string) => Promise<void>;

  bankDetails: BankDetails;
  bankDetailsRequestStatus: BankDetailsRequestStatus;
  requestBankDetailsChange: (value: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
    bankName?: string;
    branch?: string;
    accountType: string;
    upiId?: string;
  }) => Promise<void>;

  settlements: Settlement[];

  notificationPrefs: NotificationPref[];
  toggleNotificationPref: (key: string) => Promise<void>;

  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<RawVendor | null>(null);
  const [stats, setStats] = useState<RawStats>({ orders: 0, revenue: 0, rating: null });
  const [rawAddresses, setRawAddresses] = useState<RawAddress[]>([]);
  const [rawSettlements, setRawSettlements] = useState<RawSettlement[]>([]);
  const [enabledPrefs, setEnabledPrefs] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [vendorRes, statsRes, addressesRes, prefsRes, settlementsRes] = await Promise.all([
      api.get<RawVendor>('/vendor/me'),
      api.get<RawStats>('/vendor/me/stats'),
      api.get<RawAddress[]>('/vendor/me/addresses'),
      api.get<Record<string, boolean>>('/vendor/me/notification-prefs'),
      api.get<RawSettlement[]>('/vendor/me/settlements'),
    ]);
    setVendor(vendorRes.data);
    setStats(statsRes.data);
    setRawAddresses(addressesRes.data);
    setEnabledPrefs(prefsRes.data);
    setRawSettlements(settlementsRes.data);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [refresh]);

  const profile = useMemo(() => (vendor ? toProfileCore(vendor, stats) : EMPTY_PROFILE), [vendor, stats]);
  const documents = useMemo(() => (vendor ? toDocuments(vendor) : []), [vendor]);
  const additionalDocuments = useMemo(
    () => (vendor?.additionalDocuments ?? []).map(toAdditionalDocument),
    [vendor],
  );
  const bankDetails = useMemo(() => (vendor ? toBankDetails(vendor) : EMPTY_BANK), [vendor]);
  const bankDetailsRequestStatus = useMemo<BankDetailsRequestStatus>(
    () => vendor?.pendingBankDetails?.status ?? null,
    [vendor],
  );
  const addresses = useMemo(() => rawAddresses.map(toAddress), [rawAddresses]);
  const settlements = useMemo(() => rawSettlements.map(toSettlement), [rawSettlements]);
  const notificationPrefs = useMemo(
    () =>
      NOTIFICATION_PREF_DEFS.map((def) => ({
        ...def,
        enabled: enabledPrefs[def.key] ?? DEFAULT_ENABLED_KEYS.has(def.key),
      })),
    [enabledPrefs],
  );

  const updateVendorInfo = useCallback(async (value: Partial<VendorInfo>) => {
    const businessInfo: Record<string, unknown> = {};
    if (value.legalName !== undefined) businessInfo.legalName = value.legalName;
    if (value.addressLine1 !== undefined) businessInfo.addressLine1 = value.addressLine1;
    if (value.addressLine2 !== undefined) businessInfo.addressLine2 = value.addressLine2;
    if (value.city !== undefined) businessInfo.city = value.city;
    if (value.state !== undefined) businessInfo.state = value.state;
    if (value.pincode !== undefined) businessInfo.pincode = value.pincode;

    const gstDetails: Record<string, unknown> = {};
    if (value.gstNumber !== undefined) gstDetails.gstin = value.gstNumber;

    const panDetails: Record<string, unknown> = {};
    if (value.panNumber !== undefined) panDetails.panNumber = value.panNumber;

    const { data } = await api.patch<RawVendor>('/vendor/me', {
      ...(value.businessType !== undefined && { businessType: value.businessType }),
      ...(Object.keys(businessInfo).length > 0 && { businessInfo }),
      ...(Object.keys(gstDetails).length > 0 && { gstDetails }),
      ...(Object.keys(panDetails).length > 0 && { panDetails }),
    });
    setVendor(data);
  }, []);

  const updateOwnerInfo = useCallback(async (value: Partial<OwnerInfo>) => {
    const ownerInfo: Record<string, unknown> = {};
    if (value.name !== undefined) ownerInfo.fullName = value.name;
    if (value.phone !== undefined) ownerInfo.mobile = value.phone;
    if (value.email !== undefined) ownerInfo.email = value.email;
    if (value.dateOfBirth !== undefined) ownerInfo.dob = value.dateOfBirth;

    const { data } = await api.patch<RawVendor>('/vendor/me', {
      ...(Object.keys(ownerInfo).length > 0 && { ownerInfo }),
    });
    setVendor(data);
  }, []);

  const updateStoreInfo = useCallback(async (value: Partial<StoreInfo>) => {
    const storeProfile: Record<string, unknown> = {};
    if (value.category !== undefined) storeProfile.primaryCategory = value.category;
    if (value.subCategory !== undefined) storeProfile.subCategory = value.subCategory;
    if (value.tags !== undefined) storeProfile.tags = value.tags;
    if (value.description !== undefined) storeProfile.description = value.description;
    if (value.minimumOrderValue !== undefined) storeProfile.minimumOrderValue = value.minimumOrderValue;
    if (value.avgPrepTime !== undefined) storeProfile.avgPrepTime = value.avgPrepTime;

    const storeInfo: Record<string, unknown> = {};
    if (value.contactNumber !== undefined) storeInfo.contactNumber = value.contactNumber;

    const { data } = await api.patch<RawVendor>('/vendor/me', {
      ...(Object.keys(storeProfile).length > 0 && { storeProfile }),
      ...(Object.keys(storeInfo).length > 0 && { storeInfo }),
    });
    setVendor(data);
  }, []);

  const updateProfileBasics = useCallback(async (value: { storeName?: string; avatarInitials?: string }) => {
    if (value.storeName === undefined) return;
    const { data } = await api.patch<RawVendor>('/vendor/me', { storeProfile: { storeName: value.storeName } });
    setVendor(data);
  }, []);

  const updateStoreLogo = useCallback(async (source: 'camera' | 'gallery') => {
    const url = await pickAndUploadLogo(source);
    if (!url) return;
    setVendor((prev) => (prev ? { ...prev, storeLogoUrl: url } : prev));
  }, []);

  const updateStoreCover = useCallback(async (source: 'camera' | 'gallery') => {
    const url = await pickAndUploadCoverImage(source);
    if (!url) return;
    setVendor((prev) => (prev ? { ...prev, storeCoverImageUrl: url } : prev));
  }, []);

  const getAddress = useCallback((addressId: string) => addresses.find((a) => a.id === addressId), [addresses]);

  const addAddress = useCallback(
    async (address: { label: string; line1: string; line2?: string; lat?: number; lng?: number }) => {
      const { data } = await api.post<RawAddress[]>('/vendor/me/addresses', address);
      setRawAddresses(data);
    },
    [],
  );

  const updateAddress = useCallback(async (addressId: string, value: Partial<Address>) => {
    const { data } = await api.patch<RawAddress[]>(`/vendor/me/addresses/${addressId}`, value);
    setRawAddresses(data);
  }, []);

  const removeAddress = useCallback(async (addressId: string) => {
    const { data } = await api.delete<RawAddress[]>(`/vendor/me/addresses/${addressId}`);
    setRawAddresses(data);
  }, []);

  const setPrimaryAddress = useCallback(async (addressId: string) => {
    const { data } = await api.patch<RawAddress[]>(`/vendor/me/addresses/${addressId}/primary`);
    setRawAddresses(data);
  }, []);

  const getDocument = useCallback((documentId: string) => documents.find((d) => d.id === documentId), [documents]);

  const replaceDocument = useCallback(async (documentId: string, url: string) => {
    const { data } = await api.patch<RawVendor>(`/vendor/me/documents/${documentId}/replace`, { url });
    setVendor(data);
  }, []);

  const addAdditionalDocument = useCallback(async (name: string, url: string) => {
    const { data } = await api.post<RawAdditionalDocument[]>('/vendor/me/documents/additional', { name, url });
    setVendor((prev) => (prev ? { ...prev, additionalDocuments: data } : prev));
  }, []);

  const removeAdditionalDocument = useCallback(async (documentId: string) => {
    const { data } = await api.delete<RawAdditionalDocument[]>(`/vendor/me/documents/additional/${documentId}`);
    setVendor((prev) => (prev ? { ...prev, additionalDocuments: data } : prev));
  }, []);

  const requestBankDetailsChange = useCallback(
    async (value: {
      accountHolderName: string;
      accountNumber: string;
      ifsc: string;
      bankName?: string;
      branch?: string;
      accountType: string;
      upiId?: string;
    }) => {
      const { data } = await api.post<RawPendingBankDetails>('/vendor/me/bank-details/request', value);
      setVendor((prev) => (prev ? { ...prev, pendingBankDetails: data } : prev));
    },
    [],
  );

  const toggleNotificationPref = useCallback(
    async (key: string) => {
      const def = NOTIFICATION_PREF_DEFS.find((d) => d.key === key);
      if (!def || def.locked) return;
      const nextEnabled = !(enabledPrefs[key] ?? DEFAULT_ENABLED_KEYS.has(key));
      setEnabledPrefs((prev) => ({ ...prev, [key]: nextEnabled }));
      try {
        await api.patch('/vendor/me/notification-prefs', { [key]: nextEnabled });
      } catch {
        setEnabledPrefs((prev) => ({ ...prev, [key]: !nextEnabled }));
      }
    },
    [enabledPrefs],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      isLoading,
      profile,
      updateVendorInfo,
      updateOwnerInfo,
      updateStoreInfo,
      updateProfileBasics,
      updateStoreLogo,
      updateStoreCover,
      addresses,
      getAddress,
      addAddress,
      updateAddress,
      removeAddress,
      setPrimaryAddress,
      documents,
      getDocument,
      replaceDocument,
      additionalDocuments,
      addAdditionalDocument,
      removeAdditionalDocument,
      bankDetails,
      bankDetailsRequestStatus,
      requestBankDetailsChange,
      settlements,
      notificationPrefs,
      toggleNotificationPref,
      refresh,
    }),
    [
      isLoading,
      profile,
      updateVendorInfo,
      updateOwnerInfo,
      updateStoreInfo,
      updateProfileBasics,
      updateStoreLogo,
      updateStoreCover,
      addresses,
      getAddress,
      addAddress,
      updateAddress,
      removeAddress,
      setPrimaryAddress,
      documents,
      getDocument,
      replaceDocument,
      additionalDocuments,
      addAdditionalDocument,
      removeAdditionalDocument,
      bankDetails,
      bankDetailsRequestStatus,
      requestBankDetailsChange,
      settlements,
      notificationPrefs,
      toggleNotificationPref,
      refresh,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
