import axios from 'axios';
import { Alert } from 'react-native';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { resetNavigation } from '../../navigation/navigationRef';
import { resolveVendorEntryRoute } from '../../utils/vendorRouting';

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(iso: string): string {
  const date = isoToDate(iso);
  if (!date) return iso;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function isRegistrationLockedError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) return false;
  const body = error.response.data as { reason?: string; details?: { reason?: string } } | undefined;
  return body?.reason === 'registration_locked' || body?.details?.reason === 'registration_locked';
}

async function goToRegistrationStatus() {
  try {
    const route = await resolveVendorEntryRoute();
    resetNavigation(route.name, route.params as never);
  } catch {
    resetNavigation('KYCPending');
  }
}

export function showRegistrationLocked() {
  Alert.alert(
    'Application already submitted',
    'Your registration has been submitted and can no longer be edited here. We will take you to your application status.',
    [
      {
        text: 'View status',
        onPress: () => {
          goToRegistrationStatus();
        },
      },
    ],
    { cancelable: false },
  );
}

/** Maps 422 `details` onto the given form fields; details for fields the form
 * doesn't render (and any non-422 error) become a form-level message. */
export function handleFormSaveError<E extends Record<string, string | undefined>>(
  error: unknown,
  setErrors: (errors: E) => void,
  fallback: string,
  knownFields: readonly string[],
) {
  const fieldErrors = getFieldErrors(error);
  const keys = Object.keys(fieldErrors);
  if (keys.length > 0) {
    const next: Record<string, string> = {};
    const unshown: string[] = [];
    for (const key of keys) {
      if (knownFields.includes(key)) next[key] = fieldErrors[key];
      else unshown.push(fieldErrors[key]);
    }
    if (unshown.length > 0) next.form = unshown.join('\n');
    setErrors(next as E);
  } else {
    setErrors({ form: getApiErrorMessage(error, fallback) } as unknown as E);
  }
}

/** Like handleFormSaveError, but a 409 registration_locked sends the vendor to their status screen. */
export function handleRegistrationSaveError<E extends Record<string, string | undefined>>(
  error: unknown,
  setErrors: (errors: E) => void,
  fallback: string,
  knownFields: readonly string[],
) {
  if (isRegistrationLockedError(error)) {
    showRegistrationLocked();
    return;
  }
  handleFormSaveError(error, setErrors, fallback, knownFields);
}
