import { useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { api, getApiErrorMessage } from '../../services/api';

/** Parses a TIME_OPTIONS label such as "9:30 PM" into minutes after midnight. */
export function timeToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(label.trim());
  if (!match) return null;
  let hour = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + parseInt(match[2], 10);
}

export function isCloseAfterOpen(open: string, close: string): boolean {
  const openMinutes = timeToMinutes(open);
  const closeMinutes = timeToMinutes(close);
  return openMinutes !== null && closeMinutes !== null && closeMinutes > openMinutes;
}

const STEP_SCREEN: Record<string, keyof AuthStackParamList> = {
  profile: 'StoreProfile',
  media: 'StoreLogoUpload',
  address: 'StoreAddress',
  hours: 'OperatingHours',
  delivery: 'DeliverySettings',
  availability: 'ServiceAvailability',
  status: 'StoreStatus',
};

/**
 * Finalises store setup with POST /vendor/store-setup/complete and only then
 * shows the success screen; a 422 sends the vendor to the first missing step.
 */
export function useFinishStoreSetup<R extends keyof AuthStackParamList>(
  navigation: NativeStackNavigationProp<AuthStackParamList, R>,
) {
  const { refresh } = useStoreSetup();
  const { refreshVendor } = useVendorAuth();

  return useCallback(async () => {
    try {
      await api.post('/vendor/store-setup/complete');
    } catch (err) {
      const missing =
        axios.isAxiosError(err) && err.response?.status === 422
          ? ((err.response.data as { missingSteps?: string[] } | undefined)?.missingSteps ?? [])
          : [];
      const target = missing.map(step => STEP_SCREEN[step]).find(Boolean);
      if (target) {
        Alert.alert('Store setup incomplete', 'Please complete the remaining step before finishing.', [
          { text: 'Continue', onPress: () => navigation.navigate(target as 'StoreProfile') },
        ]);
      } else {
        Alert.alert('Could not finish store setup', getApiErrorMessage(err));
      }
      return false;
    }
    await Promise.all([refresh(), refreshVendor().catch(() => undefined)]);
    navigation.reset({ index: 0, routes: [{ name: 'StoreSetupComplete' }] });
    return true;
  }, [navigation, refresh, refreshVendor]);
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats a date the way holidays/closures are stored, e.g. "05 Nov 2026". */
export function formatShortDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

export function parseShortDate(display: string): Date | null {
  const parts = display.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const monthIndex = MONTH_ABBR.indexOf(parts[1].slice(0, 3));
  const year = parseInt(parts[2], 10);
  if (!Number.isInteger(day) || monthIndex === -1 || !Number.isInteger(year)) return null;
  return new Date(year, monthIndex, day);
}
