import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { EvidenceFile, SupportTicket, TicketPriority, useSupport } from './SupportContext';

type SupportDraft = {
  categoryId?: string;
  categoryLabel?: string;
  issueId?: string;
  issueTitle?: string;
  description: string;
  orderId?: string;
  evidence: EvidenceFile[];
};

const INITIAL_DRAFT: SupportDraft = {
  description: '',
  evidence: [],
};

type SupportDraftContextValue = {
  draft: SupportDraft;
  setCategory: (categoryId: string, categoryLabel: string) => void;
  setIssue: (issueId: string, issueTitle: string) => void;
  setDescription: (description: string, orderId?: string) => void;
  addEvidence: (file: EvidenceFile) => void;
  removeEvidence: (fileId: string) => void;
  resetDraft: () => void;
  submitTicket: () => SupportTicket;
};

const SupportDraftContext = createContext<SupportDraftContextValue | null>(null);

export function SupportDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<SupportDraft>(INITIAL_DRAFT);
  const { createTicket } = useSupport();

  const setCategory = useCallback((categoryId: string, categoryLabel: string) => {
    setDraft(prev => ({ ...prev, categoryId, categoryLabel }));
  }, []);

  const setIssue = useCallback((issueId: string, issueTitle: string) => {
    setDraft(prev => ({ ...prev, issueId, issueTitle }));
  }, []);

  const setDescription = useCallback((description: string, orderId?: string) => {
    setDraft(prev => ({ ...prev, description, orderId }));
  }, []);

  const addEvidence = useCallback((file: EvidenceFile) => {
    setDraft(prev => ({ ...prev, evidence: [...prev.evidence, file] }));
  }, []);

  const removeEvidence = useCallback((fileId: string) => {
    setDraft(prev => ({ ...prev, evidence: prev.evidence.filter(f => f.id !== fileId) }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  const submitTicket = useCallback(() => {
    const priority: TicketPriority = draft.evidence.length > 0 ? 'medium' : 'low';
    const ticket: SupportTicket = {
      id: `VDT-${Math.floor(2900 + Math.random() * 90)}`,
      categoryId: draft.categoryId ?? 'other',
      categoryLabel: draft.categoryLabel ?? 'Other',
      issueTitle: draft.issueTitle ?? 'Other issue',
      description: draft.description || 'No additional details provided.',
      orderId: draft.orderId,
      status: 'open',
      priority,
      assignedTeam: 'Support Team',
      openedLabel: 'Just now',
      openedTimeLabel: 'Just now',
      timeline: [
        { label: 'Ticket Opened', sublabel: 'Just now', status: 'done' },
        { label: 'Under Review', sublabel: 'Upcoming', status: 'pending' },
        { label: 'Resolution Pending', sublabel: 'Upcoming', status: 'pending' },
      ],
      evidence: draft.evidence,
      messages: [
        {
          id: 'm1',
          from: 'vendor',
          authorName: 'You',
          text: draft.description || 'No additional details provided.',
          timeLabel: 'Just now',
        },
      ],
    };
    createTicket(ticket);
    return ticket;
  }, [draft, createTicket]);

  const value = useMemo(
    () => ({
      draft,
      setCategory,
      setIssue,
      setDescription,
      addEvidence,
      removeEvidence,
      resetDraft,
      submitTicket,
    }),
    [draft, setCategory, setIssue, setDescription, addEvidence, removeEvidence, resetDraft, submitTicket],
  );

  return <SupportDraftContext.Provider value={value}>{children}</SupportDraftContext.Provider>;
}

export function useSupportDraft() {
  const context = useContext(SupportDraftContext);
  if (!context) {
    throw new Error('useSupportDraft must be used within a SupportDraftProvider');
  }
  return context;
}
