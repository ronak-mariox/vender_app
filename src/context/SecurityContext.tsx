import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useProfile } from './ProfileContext';

export type SecuritySession = {
  id: string;
  deviceLabel: string;
  location: string;
  isCurrentDevice: boolean;
  isActive: boolean;
  lastActiveLabel: string;
};

export type LoginHistoryEntry = {
  id: string;
  timestampLabel: string;
  location: string;
  deviceLabel: string;
  status: 'success' | 'failed';
};

const INITIAL_SESSIONS: SecuritySession[] = [
  {
    id: 'sess-redmi',
    deviceLabel: 'Redmi Note 12 · Android 14',
    location: 'Mumbai, India',
    isCurrentDevice: true,
    isActive: true,
    lastActiveLabel: 'Active now',
  },
  {
    id: 'sess-galaxy-tab',
    deviceLabel: 'Samsung Galaxy Tab · Android 13',
    location: 'Pune, India',
    isCurrentDevice: false,
    isActive: false,
    lastActiveLabel: 'Last active 2 hours ago',
  },
];

const INITIAL_LOGIN_HISTORY: LoginHistoryEntry[] = [
  { id: 'login-1', timestampLabel: 'Today, 9:41 AM', location: 'Mumbai, India', deviceLabel: 'Redmi Note 12', status: 'success' },
  { id: 'login-2', timestampLabel: 'Yesterday, 7:05 PM', location: 'Pune, India', deviceLabel: 'Samsung Galaxy Tab', status: 'success' },
  { id: 'login-3', timestampLabel: '3 days ago, 11:20 AM', location: 'Mumbai, India', deviceLabel: 'Redmi Note 12', status: 'success' },
  { id: 'login-4', timestampLabel: '5 days ago, 6:48 PM', location: 'Unknown location', deviceLabel: 'Unknown device', status: 'failed' },
];

type SecurityContextValue = {
  securityScore: number;
  securityScoreTip: string;
  mobileNumber: string;
  pinLastChangedLabel: string;
  changeMobileNumber: (newNumber: string) => void;
  changePin: (newPin: string) => void;

  twoFactorEnabled: boolean;
  toggleTwoFactor: () => void;

  sessions: SecuritySession[];
  activeSessionCount: number;
  signOutSession: (sessionId: string) => void;
  signOutAllOtherSessions: () => void;

  loginHistory: LoginHistoryEntry[];
};

const SecurityContext = createContext<SecurityContextValue | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateOwnerInfo } = useProfile();
  const [pinLastChangedLabel, setPinLastChangedLabel] = useState('3 months ago');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessions, setSessions] = useState<SecuritySession[]>(INITIAL_SESSIONS);
  const [loginHistory] = useState<LoginHistoryEntry[]>(INITIAL_LOGIN_HISTORY);

  const changeMobileNumber = useCallback(
    (newNumber: string) => {
      updateOwnerInfo({ phone: newNumber });
    },
    [updateOwnerInfo],
  );

  const changePin = useCallback((_newPin: string) => {
    setPinLastChangedLabel('just now');
  }, []);

  const toggleTwoFactor = useCallback(() => {
    setTwoFactorEnabled(prev => !prev);
  }, []);

  const signOutSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.isCurrentDevice || session.id !== sessionId));
  }, []);

  const signOutAllOtherSessions = useCallback(() => {
    setSessions(prev => prev.filter(session => session.isCurrentDevice));
  }, []);

  const value = useMemo<SecurityContextValue>(
    () => ({
      securityScore: 85,
      securityScoreTip: 'Tip: Enable biometric login to reach 100',
      mobileNumber: profile.owner.phone,
      pinLastChangedLabel,
      changeMobileNumber,
      changePin,
      twoFactorEnabled,
      toggleTwoFactor,
      sessions,
      activeSessionCount: sessions.length,
      signOutSession,
      signOutAllOtherSessions,
      loginHistory,
    }),
    [
      profile.owner.phone,
      pinLastChangedLabel,
      changeMobileNumber,
      changePin,
      twoFactorEnabled,
      toggleTwoFactor,
      sessions,
      signOutSession,
      signOutAllOtherSessions,
      loginHistory,
    ],
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
