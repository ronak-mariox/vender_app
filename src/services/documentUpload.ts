import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { api } from './api';

type PickSource = 'camera' | 'gallery';

/** Picks a photo of a KYC document (PAN, GST certificate, business proof — the
 * same way they're captured during registration) and uploads it to the real
 * registration document-upload endpoint, returning the server-assigned
 * relative URL, or `null` if the user cancelled the picker. */
export async function pickAndUploadVendorDocument(source: PickSource): Promise<string | null> {
  const options = { mediaType: 'photo' as const, quality: 0.8 as const, selectionLimit: 1 as const };
  const result = source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

  if (result.didCancel || !result.assets || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (!asset.uri) return null;

  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? `document-${Date.now()}.jpg`,
  } as unknown as Blob);

  const { data } = await api.post<{ url: string }>('/vendor/registration/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
