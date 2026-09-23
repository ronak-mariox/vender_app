import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { api } from './api';

type PickSource = 'camera' | 'gallery';

/** Picks a product photo and uploads it to `POST /vendor/products/upload-image`,
 * returning the server-assigned relative URL (e.g. `/uploads/xyz.jpg`), or `null`
 * if the user cancelled the picker or no file was selected. */
export async function pickAndUploadProductImage(source: PickSource): Promise<string | null> {
  const options = { mediaType: 'photo' as const, quality: 0.8 as const, selectionLimit: 1 as const };
  const result = source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

  if (result.didCancel || !result.assets || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (!asset.uri) return null;

  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
  } as unknown as Blob);

  const { data } = await api.post<{ url: string }>('/vendor/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
