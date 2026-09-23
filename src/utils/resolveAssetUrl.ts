import { API_ORIGIN } from '../services/api';

/** Turns a backend-relative upload path (e.g. `/uploads/xyz.jpg`) into an absolute
 * URI an `<Image source={{uri}}>` can actually load. Already-absolute URLs pass through. */
export function resolveAssetUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}
