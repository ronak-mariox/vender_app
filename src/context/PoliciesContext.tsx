import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type PolicyId = 'terms' | 'privacy' | 'cancellation' | 'settlement';

export type PolicyDocMeta = {
  id: PolicyId;
  title: string;
  lastUpdatedLabel: string;
  effectiveLabel?: string;
  accepted: boolean;
};

export type VendorAgreementMeta = {
  version: string;
  signedLabel: string;
  status: 'Signed & Active';
  commissionRate: string;
  settlementCadence: string;
  slaLabel: string;
  newVersionAvailable: boolean;
  newVersionLabel: string;
};

const INITIAL_DOCS: Record<PolicyId, PolicyDocMeta> = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    lastUpdatedLabel: '1 Oct 2024',
    effectiveLabel: '1 Nov 2024',
    accepted: true,
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    lastUpdatedLabel: '1 Oct 2024',
    effectiveLabel: '1 Nov 2024',
    accepted: true,
  },
  cancellation: {
    id: 'cancellation',
    title: 'Cancellation Policy',
    lastUpdatedLabel: '1 Oct 2024',
    accepted: true,
  },
  settlement: {
    id: 'settlement',
    title: 'Settlement Policy',
    lastUpdatedLabel: '1 Oct 2024',
    accepted: true,
  },
};

const INITIAL_VENDOR_AGREEMENT: VendorAgreementMeta = {
  version: '3.2',
  signedLabel: '15 Jan 2024',
  status: 'Signed & Active',
  commissionRate: '8%',
  settlementCadence: 'Weekly',
  slaLabel: '10 min',
  newVersionAvailable: true,
  newVersionLabel: 'Version 4.0',
};

type PoliciesContextValue = {
  documents: Record<PolicyId, PolicyDocMeta>;
  getDocument: (id: PolicyId) => PolicyDocMeta;
  acceptPolicy: (id: PolicyId) => void;
  vendorAgreement: VendorAgreementMeta;
};

const PoliciesContext = createContext<PoliciesContextValue | null>(null);

export function PoliciesProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Record<PolicyId, PolicyDocMeta>>(INITIAL_DOCS);
  const [vendorAgreement] = useState<VendorAgreementMeta>(INITIAL_VENDOR_AGREEMENT);

  const getDocument = useCallback((id: PolicyId) => documents[id], [documents]);

  const acceptPolicy = useCallback((id: PolicyId) => {
    setDocuments(prev => ({ ...prev, [id]: { ...prev[id], accepted: true } }));
  }, []);

  const value = useMemo<PoliciesContextValue>(
    () => ({ documents, getDocument, acceptPolicy, vendorAgreement }),
    [documents, getDocument, acceptPolicy, vendorAgreement],
  );

  return <PoliciesContext.Provider value={value}>{children}</PoliciesContext.Provider>;
}

export function usePolicies() {
  const context = useContext(PoliciesContext);
  if (!context) {
    throw new Error('usePolicies must be used within a PoliciesProvider');
  }
  return context;
}
