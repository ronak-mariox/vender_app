import type { AuthStackParamList } from '../navigation/types';
import { api } from '../services/api';

type RegistrationStepKey =
  | 'business-type'
  | 'business-info'
  | 'owner-info'
  | 'store-info'
  | 'gst-details'
  | 'pan-details'
  | 'business-proof'
  | 'bank-details';

interface VendorStatusResponse {
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  kycStatus: 'pending' | 'verified' | 'rejected';
  registrationStep: string;
  referenceId: string | null;
  rejectionReason: string | null;
  nextStep: RegistrationStepKey | null;
}

const STEP_SCREEN: Record<RegistrationStepKey, keyof AuthStackParamList> = {
  'business-type': 'BusinessType',
  'business-info': 'BusinessInfo',
  'owner-info': 'OwnerInfo',
  'store-info': 'StoreInfo',
  'gst-details': 'GSTDetails',
  'pan-details': 'PANVerification',
  'business-proof': 'BusinessProof',
  'bank-details': 'BankDetails',
};

export interface VendorEntryRoute {
  name: keyof AuthStackParamList;
  params?: AuthStackParamList[keyof AuthStackParamList];
}

/**
 * Decides where a vendor should land after becoming authenticated (password login,
 * OTP account creation, or a future session-restore) — business registration is
 * mandatory before the app is usable, so this NEVER returns 'Dashboard' unless the
 * account is both fully registered (every step filled + formally submitted) and
 * approved. Call this instead of hardcoding a destination anywhere a vendor logs in.
 */
export async function resolveVendorEntryRoute(): Promise<VendorEntryRoute> {
  const { data } = await api.get<VendorStatusResponse>('/vendor/registration/status');

  if (data.nextStep) {
    return { name: STEP_SCREEN[data.nextStep] };
  }

  // All 8 steps are filled in, but the vendor hasn't walked through
  // Review -> Agreement -> Submit yet.
  if (data.registrationStep !== 'submitted') {
    return { name: 'KYCReview' };
  }

  if (data.status === 'active') {
    return { name: 'Dashboard' };
  }
  if (data.status === 'rejected') {
    return { name: 'KYCRejected', params: { rejectionReason: data.rejectionReason ?? undefined } };
  }
  // 'pending' (awaiting admin review) and 'suspended' both land here for now — there's
  // no dedicated "suspended" screen yet, and KYCPending's copy ("we're reviewing your
  // application") is a reasonable holding state until one exists.
  return { name: 'KYCPending' };
}
