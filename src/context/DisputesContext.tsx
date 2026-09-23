import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type DisputeStatus =
  | 'issue-raised'
  | 'accepted'
  | 'disputed'
  | 'under-support-review'
  | 'decided'
  | 'resolved';

export type DisputeEvidenceFile = {
  id: string;
  name: string;
  type: 'image' | 'pdf';
};

export type Dispute = {
  id: string;
  orderId: string;
  customerName: string;
  orderDateLabel: string;
  issueRaisedLabel: string;
  issueType: string;
  productName: string;
  claimAmount: number;
  customerStatement: string;
  status: DisputeStatus;
  vendorStatement?: string;
  evidence: DisputeEvidenceFile[];
  decisionOutcome?: string;
  decisionAmount?: number;
  decisionReasoning?: string;
  vendorAdjustment?: number;
};

const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'DSP-1047',
    orderId: '#VD9102',
    customerName: 'Rajesh K.',
    orderDateLabel: '3 Nov 2024',
    issueRaisedLabel: 'Today, 9:15 AM',
    issueType: 'Damaged Item',
    productName: 'Fortune Oil 1L',
    claimAmount: 180,
    customerStatement: 'Item was damaged. Bottle of Fortune Oil arrived broken.',
    status: 'issue-raised',
    evidence: [],
  },
  {
    id: 'DSP-1032',
    orderId: '#VD9051',
    customerName: 'Priya S.',
    orderDateLabel: '28 Oct 2024',
    issueRaisedLabel: '29 Oct 2024, 6:40 PM',
    issueType: 'Wrong Item',
    productName: 'Amul Full Cream Milk',
    claimAmount: 120,
    customerStatement: 'I ordered toned milk but received full cream milk instead.',
    status: 'resolved',
    vendorStatement: 'Packing error confirmed on our end — accepted the claim.',
    evidence: [],
    decisionOutcome: 'Full Refund',
    decisionAmount: 120,
    decisionReasoning: 'Vendor accepted responsibility within 48 hours.',
    vendorAdjustment: 120,
  },
];

type DisputesContextValue = {
  disputes: Dispute[];
  getDispute: (disputeId: string) => Dispute | undefined;
  acceptDispute: (disputeId: string) => void;
  setVendorStatementDraft: (disputeId: string, vendorStatement: string) => void;
  markDisputed: (disputeId: string, vendorStatement: string) => void;
  addEvidence: (disputeId: string, file: DisputeEvidenceFile) => void;
  removeEvidence: (disputeId: string, fileId: string) => void;
  submitDispute: (disputeId: string) => void;
  issueDecision: (disputeId: string) => void;
  acceptDecision: (disputeId: string) => void;
  appealDecision: (disputeId: string) => void;
};

const DisputesContext = createContext<DisputesContextValue | null>(null);

function updateDispute(
  disputes: Dispute[],
  disputeId: string,
  patch: Partial<Dispute> | ((dispute: Dispute) => Partial<Dispute>),
): Dispute[] {
  return disputes.map(d => {
    if (d.id !== disputeId) return d;
    const resolved = typeof patch === 'function' ? patch(d) : patch;
    return { ...d, ...resolved };
  });
}

export function DisputesProvider({ children }: { children: React.ReactNode }) {
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);

  const getDispute = useCallback((disputeId: string) => disputes.find(d => d.id === disputeId), [disputes]);

  const acceptDispute = useCallback((disputeId: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { status: 'accepted' }));
  }, []);

  const setVendorStatementDraft = useCallback((disputeId: string, vendorStatement: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { vendorStatement }));
  }, []);

  const markDisputed = useCallback((disputeId: string, vendorStatement: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { status: 'disputed', vendorStatement }));
  }, []);

  const addEvidence = useCallback((disputeId: string, file: DisputeEvidenceFile) => {
    setDisputes(prev => updateDispute(prev, disputeId, d => ({ evidence: [...d.evidence, file] })));
  }, []);

  const removeEvidence = useCallback((disputeId: string, fileId: string) => {
    setDisputes(prev =>
      updateDispute(prev, disputeId, d => ({ evidence: d.evidence.filter(f => f.id !== fileId) })),
    );
  }, []);

  const submitDispute = useCallback((disputeId: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { status: 'under-support-review' }));
  }, []);

  const issueDecision = useCallback((disputeId: string) => {
    setDisputes(prev =>
      updateDispute(prev, disputeId, d => ({
        status: 'decided',
        decisionOutcome: 'Partial Resolution',
        decisionAmount: Math.round(d.claimAmount / 2),
        decisionReasoning: 'Evidence inconclusive. Partial responsibility assigned.',
        vendorAdjustment: Math.round(d.claimAmount / 2),
      })),
    );
  }, []);

  const acceptDecision = useCallback((disputeId: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { status: 'resolved' }));
  }, []);

  const appealDecision = useCallback((disputeId: string) => {
    setDisputes(prev => updateDispute(prev, disputeId, { status: 'under-support-review' }));
  }, []);

  const value = useMemo(
    () => ({
      disputes,
      getDispute,
      acceptDispute,
      setVendorStatementDraft,
      markDisputed,
      addEvidence,
      removeEvidence,
      submitDispute,
      issueDecision,
      acceptDecision,
      appealDecision,
    }),
    [
      disputes,
      getDispute,
      acceptDispute,
      setVendorStatementDraft,
      markDisputed,
      addEvidence,
      removeEvidence,
      submitDispute,
      issueDecision,
      acceptDecision,
      appealDecision,
    ],
  );

  return <DisputesContext.Provider value={value}>{children}</DisputesContext.Provider>;
}

export function useDisputes() {
  const context = useContext(DisputesContext);
  if (!context) {
    throw new Error('useDisputes must be used within a DisputesProvider');
  }
  return context;
}
