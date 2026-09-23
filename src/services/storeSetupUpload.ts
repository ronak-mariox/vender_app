import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { api } from './api';

type PickSource = 'camera' | 'gallery';

async function pickImage(source: PickSource) {
  const options = { mediaType: 'photo' as const, quality: 0.8 as const, selectionLimit: 1 as const };
  const result = source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

  if (result.didCancel || !result.assets || result.assets.length === 0) return null;
  const asset = result.assets[0];
  if (!asset.uri) return null;
  return asset;
}

async function uploadTo(endpoint: string, asset: NonNullable<Awaited<ReturnType<typeof pickImage>>>) {
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
  } as unknown as Blob);

  const { data } = await api.post<{ storeLogoUrl?: string; storeCoverImageUrl?: string }>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Picks a store logo image and uploads it to `POST /vendor/store-setup/logo`. */
export async function pickAndUploadLogo(source: PickSource): Promise<string | null> {
  const asset = await pickImage(source);
  if (!asset) return null;
  const { storeLogoUrl } = await uploadTo('/vendor/store-setup/logo', asset);
  return storeLogoUrl ?? null;
}

/** Picks a store cover image and uploads it to `POST /vendor/store-setup/cover-image`. */
export async function pickAndUploadCoverImage(source: PickSource): Promise<string | null> {
  const asset = await pickImage(source);
  if (!asset) return null;
  const { storeCoverImageUrl } = await uploadTo('/vendor/store-setup/cover-image', asset);
  return storeCoverImageUrl ?? null;
}
