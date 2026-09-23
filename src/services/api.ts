import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL for the vendor backend API.
 *
 * - iOS Simulator (running on the same Mac as the backend): `localhost` works as-is.
 * - Android Emulator: the emulator can't see the host machine's `localhost` — use
 *   `http://10.0.2.2:4000/api` instead (the emulator's alias for the host loopback).
 * - Physical device (iOS or Android) on the same Wi-Fi as your dev machine: use your
 *   machine's LAN IP instead, e.g. `http://192.168.1.23:4000/api`.
 */
export const API_BASE_URL = 'http://localhost:4000/api';

/** The backend's origin (no `/api` suffix) — for resolving relative asset URLs
 * like `/uploads/xyz.jpg` (returned by upload endpoints) into a displayable URI. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const ACCESS_TOKEN_KEY = 'vendor_access_token';
export const REFRESH_TOKEN_KEY = 'vendor_refresh_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

function resolveQueue(token: string | null, error?: unknown) {
  pendingQueue.forEach(entry => (token ? entry.resolve(token) : entry.reject(error)));
  pendingQueue = [];
}

let forceLogoutHandler: (() => void) | null = null;

/** Registered by VendorAuthContext so a failed silent refresh can clear app auth state. */
export function setForceLogoutHandler(handler: (() => void) | null) {
  forceLogoutHandler = handler;
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/vendor/auth/login') ||
      url.includes('/auth/logout');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            if (!originalRequest.headers) {
              originalRequest.headers = new AxiosHeaders();
            }
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
      );

      await AsyncStorage.setMany({
        [ACCESS_TOKEN_KEY]: data.accessToken,
        [REFRESH_TOKEN_KEY]: data.refreshToken,
      });

      resolveQueue(data.accessToken);

      if (!originalRequest.headers) {
        originalRequest.headers = new AxiosHeaders();
      }
      originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(null, refreshError);

      // Only treat this as "the session is genuinely gone" when the server actually
      // rejected the refresh token (401/403). A network error, timeout, or 5xx here
      // just means we couldn't refresh right now — the stored refresh token is likely
      // still perfectly valid, so keep it rather than forcing a fresh login over what
      // might be a brief connectivity blip or the backend being momentarily unreachable.
      const refreshStatus = axios.isAxiosError(refreshError) ? refreshError.response?.status : undefined;
      if (refreshStatus === 401 || refreshStatus === 403) {
        await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        forceLogoutHandler?.();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: { path: string; msg: string }[];
};

/** Extracts a user-facing message from an axios error thrown by the API above. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.details?.length) {
      return data.details.map(detail => detail.msg).join('\n');
    }
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error.message === 'Network Error') {
      return 'Could not reach the server. Check your connection and try again.';
    }
  }
  return fallback;
}

/** Extracts field-level validation errors (422 responses) keyed by field path. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.details?.length) {
      const fieldErrors: Record<string, string> = {};
      for (const detail of data.details) {
        const leafKey = detail.path.includes('.') ? detail.path.split('.').pop()! : detail.path;
        if (!fieldErrors[leafKey]) fieldErrors[leafKey] = detail.msg;
      }
      return fieldErrors;
    }
  }
  return {};
}
