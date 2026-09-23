import { launchImageLibrary } from 'react-native-image-picker';
import { api } from './api';

/**
 * Picks an image from the device library and uploads it to
 * `POST /vendor/registration/documents`, returning the server-assigned URL.
 *
 * Uses `react-native-image-picker` (JPEG/PNG only). The backend's upload endpoint
 * also accepts PDF, but `react-native-image-picker` can only pick images/video —
 * supporting PDF selection would need `react-native-document-picker` as a follow-up.
 *
 * Returns `null` if the user cancelled the picker or no file was selected;
 * throws if the upload request itself fails (network/server error).
 */
export async function pickAndUploadDocument(): Promise<{ url: string } | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 1,
  });

  if (result.didCancel || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset.uri) {
    return null;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
  } as unknown as Blob);

  const { data } = await api.post<{ url: string }>('/vendor/registration/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
