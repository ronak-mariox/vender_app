import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESS_TOKEN_KEY, api, REFRESH_TOKEN_KEY, setForceLogoutHandler } from '../services/api';

const SESSION_RESTORE_RETRIES = 2;
const SESSION_RESTORE_RETRY_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export type VendorProfile = {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  status: string;
  kycStatus: string;
  registrationStep: string;
  referenceId: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // The registration step fields (businessInfo, ownerInfo, ...) come back from
  // GET /vendor/me as raw JSON strings, not parsed objects — use
  // GET /vendor/registration (see RegistrationContext) when you need them parsed.
  [key: string]: unknown;
};

export type OtpIntent = 'login' | 'create-account';

export type VerifyOtpResult =
  | { accountExists: false; verifiedPhoneToken: string }
  | { accountExists: true; resetToken: string }
  | { accountExists: true }
  | { accountExists: false };

export type RegisterPayload = {
  verifiedPhoneToken: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type VendorAuthContextValue = {
  vendor: VendorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (phone: string) => Promise<{ message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string, intent: OtpIntent) => Promise<VerifyOtpResult>;
  register: (payload: RegisterPayload) => Promise<{ vendor: VendorProfile }>;
  login: (identifier: string, password: string) => Promise<{ vendor: VendorProfile }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshVendor: () => Promise<void>;
};

const VendorAuthContext = createContext<VendorAuthContextValue | null>(null);

async function persistTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setMany({
    [ACCESS_TOKEN_KEY]: accessToken,
    [REFRESH_TOKEN_KEY]: refreshToken,
  });
}

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    setVendor(null);
  }, []);

  const refreshVendor = useCallback(async () => {
    const { data } = await api.get<VendorProfile>('/vendor/me');
    setVendor(data);
  }, []);

  // Let the api layer force-clear vendor state when a silent token refresh fails.
  useEffect(() => {
    setForceLogoutHandler(() => setVendor(null));
    return () => setForceLogoutHandler(null);
  }, []);

  // Restore session on app start: if we have a stored access token, validate it against
  // the backend; otherwise start unauthenticated. Critically, a network failure here
  // (server unreachable, brief connectivity blip) must NOT clear the stored session —
  // only a genuine auth rejection (401, meaning the interceptor already tried to refresh
  // and the backend rejected that too) should log the vendor out. Losing this distinction
  // was why reopening the app after a moment offline forced a fresh login even though the
  // session was still perfectly valid.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      for (let attempt = 0; attempt <= SESSION_RESTORE_RETRIES; attempt++) {
        try {
          await refreshVendor();
          break;
        } catch (err) {
          const status = axios.isAxiosError(err) ? err.response?.status : undefined;
          if (status === 401) {
            if (!cancelled) await clearSession();
            break;
          }
          if (attempt === SESSION_RESTORE_RETRIES) {
            // Couldn't reach the server after retrying — keep the stored tokens (they're
            // likely still valid) rather than forcing a fresh login over a network problem.
            break;
          }
          await sleep(SESSION_RESTORE_RETRY_DELAY_MS);
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    const { data } = await api.post<{ message: string; devOtp?: string }>('/vendor/auth/otp/request', {
      phone,
    });
    return data;
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string, intent: OtpIntent) => {
    const { data } = await api.post<VerifyOtpResult>('/vendor/auth/otp/verify', { phone, otp, intent });
    return data;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<{ accessToken: string; refreshToken: string; vendor: VendorProfile }>(
      '/vendor/auth/register',
      payload,
    );
    await persistTokens(data.accessToken, data.refreshToken);
    setVendor(data.vendor);
    return { vendor: data.vendor };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const { data } = await api.post<{ accessToken: string; refreshToken: string; vendor: VendorProfile }>(
      '/vendor/auth/login',
      { identifier, password },
    );
    await persistTokens(data.accessToken, data.refreshToken);
    setVendor(data.vendor);
    return { vendor: data.vendor };
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    const { data } = await api.post<{ message: string }>('/vendor/auth/reset-password', {
      resetToken,
      newPassword,
    });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Best-effort: still clear local session even if the server call fails
      // (e.g. offline, or the refresh token was already revoked).
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const value = useMemo<VendorAuthContextValue>(
    () => ({
      vendor,
      isAuthenticated: Boolean(vendor),
      isLoading,
      requestOtp,
      verifyOtp,
      register,
      login,
      resetPassword,
      logout,
      refreshVendor,
    }),
    [vendor, isLoading, requestOtp, verifyOtp, register, login, resetPassword, logout, refreshVendor],
  );

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
}
