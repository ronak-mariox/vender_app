import { Platform } from 'react-native';

/**
 * Set this to reach a backend that isn't on the dev machine's loopback (e.g. a
 * physical device on the same Wi-Fi: 'http://192.168.1.23:4000'). Leave null to
 * use the simulator/emulator defaults below.
 */
const API_ORIGIN_OVERRIDE: string | null = 'http://192.168.1.33:4000';

const DEV_API_ORIGIN = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const API_ORIGIN = API_ORIGIN_OVERRIDE ?? DEV_API_ORIGIN;

if (!__DEV__ && !API_ORIGIN_OVERRIDE) {
  console.warn('API_ORIGIN_OVERRIDE is not set — release builds will point at the dev backend.');
}

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const API_TIMEOUT_MS = 15000;
