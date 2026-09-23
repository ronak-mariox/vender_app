import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IconName } from '../icons/Icon';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'reopened' | 'escalated' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export type SupportCategory = {
  id: string;
  label: string;
  icon: IconName;
  iconBg: string;
  articleCount: number;
};

export type SupportIssue = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
};

export type TicketTimelineStep = {
  label: string;
  sublabel: string;
  status: 'done' | 'active' | 'pending';
};

export type TicketMessage = {
  id: string;
  from: 'vendor' | 'support';
  authorName: string;
  text: string;
  timeLabel: string;
};

export type EvidenceFile = {
  id: string;
  name: string;
  type: 'image' | 'pdf';
};

export type SupportTicket = {
  id: string;
  categoryId: string;
  categoryLabel: string;
  issueTitle: string;
  description: string;
  orderId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTeam: string;
  openedLabel: string;
  openedTimeLabel: string;
  timeline: TicketTimelineStep[];
  evidence: EvidenceFile[];
  messages: TicketMessage[];
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'order-issues', label: 'Order Issues', icon: 'phone', iconBg: '#EFF8FF', articleCount: 12 },
  { id: 'payment-issues', label: 'Payment Issues', icon: 'credit-card', iconBg: '#FFF6ED', articleCount: 8 },
  { id: 'settlement-issues', label: 'Settlement Issues', icon: 'landmark', iconBg: '#F0FDF4', articleCount: 6 },
  { id: 'inventory-issues', label: 'Inventory Issues', icon: 'package', iconBg: '#E8F5EF', articleCount: 9 },
  { id: 'product-issues', label: 'Product Issues', icon: 'tag', iconBg: '#FAF5FF', articleCount: 11 },
  { id: 'delivery-issues', label: 'Delivery Issues', icon: 'truck', iconBg: '#FFF1F3', articleCount: 7 },
  { id: 'account-issues', label: 'Account Issues', icon: 'user', iconBg: '#F0F9FF', articleCount: 5 },
  { id: 'other', label: 'Other', icon: 'more-vertical', iconBg: '#F9FAFB', articleCount: 3 },
];

export const SUPPORT_ISSUES: SupportIssue[] = [
  { id: 'order-not-visible', categoryId: 'order-issues', title: 'Order not showing in my app', description: 'Order assigned but not visible in your dashboard' },
  { id: 'cancelled-after-prep', categoryId: 'order-issues', title: 'Customer cancelled after I prepared', description: 'Cancellation received after preparation began' },
  { id: 'wrong-items', categoryId: 'order-issues', title: 'Wrong items in order', description: 'Items in order differ from what was listed' },
  { id: 'accept-error', categoryId: 'order-issues', title: 'Unable to accept order (system error)', description: 'Technical error preventing order acceptance' },
  { id: 'complete-not-delivered', categoryId: 'order-issues', title: 'Order marked complete but not delivered', description: 'Status shows delivered but customer disputes' },
  { id: 'partner-no-show', categoryId: 'order-issues', title: 'Delivery partner did not arrive', description: 'No pickup despite order being ready' },
  { id: 'payment-not-received', categoryId: 'order-issues', title: 'Payment not received for completed order', description: 'Settlement missing for a fulfilled order' },
  { id: 'other-order', categoryId: 'order-issues', title: 'Other order issue', description: 'Something else related to orders' },

  { id: 'payment-failed', categoryId: 'payment-issues', title: 'Payment shown failed but amount deducted', description: 'Customer charged but order not confirmed' },
  { id: 'wrong-amount', categoryId: 'payment-issues', title: 'Wrong amount charged', description: 'Charged amount does not match order total' },
  { id: 'refund-delay', categoryId: 'payment-issues', title: 'Refund not processed', description: 'Customer refund pending beyond expected time' },
  { id: 'other-payment', categoryId: 'payment-issues', title: 'Other payment issue', description: 'Something else related to payments' },

  { id: 'settlement-missing', categoryId: 'settlement-issues', title: 'Settlement amount missing', description: 'Expected settlement not credited' },
  { id: 'settlement-mismatch', categoryId: 'settlement-issues', title: 'Settlement amount incorrect', description: 'Credited amount does not match breakdown' },
  { id: 'bank-details', categoryId: 'settlement-issues', title: 'Need to update bank details', description: 'Bank account changed or incorrect' },
  { id: 'other-settlement', categoryId: 'settlement-issues', title: 'Other settlement issue', description: 'Something else related to settlements' },

  { id: 'stock-not-updating', categoryId: 'inventory-issues', title: 'Stock count not updating', description: 'Manual updates not reflecting in the app' },
  { id: 'bulk-update-failed', categoryId: 'inventory-issues', title: 'Bulk update failed', description: 'Bulk stock upload returned an error' },
  { id: 'oos-still-visible', categoryId: 'inventory-issues', title: 'Out-of-stock item still visible to customers', description: 'Item shows available despite zero stock' },
  { id: 'other-inventory', categoryId: 'inventory-issues', title: 'Other inventory issue', description: 'Something else related to inventory' },

  { id: 'listing-rejected', categoryId: 'product-issues', title: 'Product listing rejected', description: 'Need clarification on rejection reason' },
  { id: 'wrong-category', categoryId: 'product-issues', title: 'Product shown in wrong category', description: 'Listing appears under an incorrect category' },
  { id: 'image-upload-fail', categoryId: 'product-issues', title: 'Unable to upload product images', description: 'Image upload fails or times out' },
  { id: 'other-product', categoryId: 'product-issues', title: 'Other product issue', description: 'Something else related to products' },

  { id: 'partner-delay', categoryId: 'delivery-issues', title: 'Delivery partner delayed', description: 'Pickup or drop taking longer than expected' },
  { id: 'wrong-address', categoryId: 'delivery-issues', title: 'Delivery to wrong address', description: 'Order delivered to an incorrect location' },
  { id: 'other-delivery', categoryId: 'delivery-issues', title: 'Other delivery issue', description: 'Something else related to delivery' },

  { id: 'login-issue', categoryId: 'account-issues', title: 'Unable to log in', description: 'OTP or login not working' },
  { id: 'kyc-issue', categoryId: 'account-issues', title: 'KYC verification stuck', description: 'Documents submitted but status not updating' },
  { id: 'other-account', categoryId: 'account-issues', title: 'Other account issue', description: 'Something else related to your account' },

  { id: 'general-feedback', categoryId: 'other', title: 'General feedback', description: 'Suggestions or feedback for the platform' },
  { id: 'other-general', categoryId: 'other', title: 'Something else', description: 'An issue not covered by other categories' },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'VDT-2847',
    categoryId: 'order-issues',
    categoryLabel: 'Order Issue',
    issueTitle: 'Customer cancelled after I prepared',
    description:
      'I had already packed the order (ORD-8821) when the customer cancelled. The items are now unsellable and I request compensation for the prepared stock.',
    orderId: 'ORD-8821',
    status: 'in-progress',
    priority: 'medium',
    assignedTeam: 'Orders Team',
    openedLabel: '5 Nov 2024',
    openedTimeLabel: '5 Nov 2024, 3:48 PM',
    timeline: [
      { label: 'Ticket Opened', sublabel: '5 Nov 2024, 3:48 PM', status: 'done' },
      { label: 'Under Review', sublabel: 'Current', status: 'active' },
      { label: 'Resolution Pending', sublabel: 'Upcoming', status: 'pending' },
    ],
    evidence: [
      { id: 'ev1', name: 'screenshot_01.jpg', type: 'image' },
      { id: 'ev2', name: 'order_detail.pdf', type: 'pdf' },
    ],
    messages: [
      {
        id: 'm1',
        from: 'vendor',
        authorName: 'You',
        text: 'Customer cancelled after I had already prepared the order. Requesting compensation.',
        timeLabel: '5 Nov 2024, 3:48 PM',
      },
      {
        id: 'm2',
        from: 'support',
        authorName: 'Verdant Support',
        text: "Thanks for reaching out — we're reviewing the order timeline and will get back to you within 24 hours.",
        timeLabel: '5 Nov 2024, 5:10 PM',
      },
    ],
  },
  {
    id: 'VDT-2801',
    categoryId: 'settlement-issues',
    categoryLabel: 'Settlement Issue',
    issueTitle: 'Settlement amount missing',
    description: 'Expected settlement for the week of 25–31 Oct was not credited to my account.',
    status: 'resolved',
    priority: 'high',
    assignedTeam: 'Payments Team',
    openedLabel: '1 Nov 2024',
    openedTimeLabel: '1 Nov 2024, 10:15 AM',
    timeline: [
      { label: 'Ticket Opened', sublabel: '1 Nov 2024, 10:15 AM', status: 'done' },
      { label: 'Under Review', sublabel: '2 Nov 2024, 9:00 AM', status: 'done' },
      { label: 'Resolved', sublabel: '3 Nov 2024, 4:20 PM', status: 'done' },
    ],
    evidence: [],
    messages: [
      {
        id: 'm1',
        from: 'vendor',
        authorName: 'You',
        text: 'My settlement for last week is missing.',
        timeLabel: '1 Nov 2024, 10:15 AM',
      },
      {
        id: 'm2',
        from: 'support',
        authorName: 'Verdant Support',
        text: 'We found a delay on our end — your settlement of ₹34,210 has now been credited.',
        timeLabel: '3 Nov 2024, 4:20 PM',
      },
    ],
  },
  {
    id: 'VDT-2756',
    categoryId: 'product-issues',
    categoryLabel: 'Product Issue',
    issueTitle: 'Product listing rejected',
    description: 'My new product listing was rejected without a clear reason.',
    status: 'closed',
    priority: 'low',
    assignedTeam: 'Catalog Team',
    openedLabel: '20 Oct 2024',
    openedTimeLabel: '20 Oct 2024, 1:00 PM',
    timeline: [
      { label: 'Ticket Opened', sublabel: '20 Oct 2024, 1:00 PM', status: 'done' },
      { label: 'Under Review', sublabel: '21 Oct 2024, 9:30 AM', status: 'done' },
      { label: 'Closed', sublabel: '22 Oct 2024, 11:00 AM', status: 'done' },
    ],
    evidence: [],
    messages: [
      {
        id: 'm1',
        from: 'support',
        authorName: 'Verdant Support',
        text: 'The listing was rejected due to a missing FSSAI number — please resubmit with the document attached.',
        timeLabel: '21 Oct 2024, 9:30 AM',
      },
    ],
  },
];

type SupportContextValue = {
  categories: SupportCategory[];
  issues: SupportIssue[];
  issuesForCategory: (categoryId: string) => SupportIssue[];
  tickets: SupportTicket[];
  getTicket: (ticketId: string) => SupportTicket | undefined;
  createTicket: (ticket: SupportTicket) => void;
  addMessage: (ticketId: string, text: string) => void;
  reopenTicket: (ticketId: string, reason: string) => void;
  escalateTicket: (ticketId: string, reason: string) => void;
  closeTicket: (ticketId: string) => void;
};

const SupportContext = createContext<SupportContextValue | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);

  const issuesForCategory = useCallback(
    (categoryId: string) => SUPPORT_ISSUES.filter(issue => issue.categoryId === categoryId),
    [],
  );

  const getTicket = useCallback((ticketId: string) => tickets.find(t => t.id === ticketId), [tickets]);

  const createTicket = useCallback((ticket: SupportTicket) => {
    setTickets(prev => [ticket, ...prev]);
  }, []);

  const addMessage = useCallback((ticketId: string, text: string) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: `m${t.messages.length + 1}`,
                  from: 'vendor',
                  authorName: 'You',
                  text,
                  timeLabel: 'Just now',
                },
              ],
            }
          : t,
      ),
    );
  }, []);

  const reopenTicket = useCallback((ticketId: string, reason: string) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'reopened',
              messages: [
                ...t.messages,
                {
                  id: `m${t.messages.length + 1}`,
                  from: 'vendor',
                  authorName: 'You',
                  text: reason,
                  timeLabel: 'Just now',
                },
              ],
            }
          : t,
      ),
    );
  }, []);

  const escalateTicket = useCallback((ticketId: string, reason: string) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status: 'escalated',
              priority: 'high',
              messages: [
                ...t.messages,
                {
                  id: `m${t.messages.length + 1}`,
                  from: 'vendor',
                  authorName: 'You',
                  text: reason,
                  timeLabel: 'Just now',
                },
              ],
            }
          : t,
      ),
    );
  }, []);

  const closeTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: 'closed' } : t)));
  }, []);

  const value = useMemo(
    () => ({
      categories: SUPPORT_CATEGORIES,
      issues: SUPPORT_ISSUES,
      issuesForCategory,
      tickets,
      getTicket,
      createTicket,
      addMessage,
      reopenTicket,
      escalateTicket,
      closeTicket,
    }),
    [issuesForCategory, tickets, getTicket, createTicket, addMessage, reopenTicket, escalateTicket, closeTicket],
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}
