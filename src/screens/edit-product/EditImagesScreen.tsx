import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { pickAndUploadProductImage } from '../../services/productImageUpload';
import { getApiErrorMessage } from '../../services/api';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditImages'>;

const MAX_GALLERY = 4;

const REQUIREMENTS = [
  'Minimum size: 800×800 pixels',
  'Accepted: JPG, PNG, WEBP',
  'Max file size: 5MB per image',
  'Clear product view on white/plain background',
];

export function EditImagesScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingSlot, setUploadingSlot] = useState<'main' | 'additional' | null>(null);
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Images" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const mainImage = images[0];
  const galleryImages = images.slice(1, 1 + MAX_GALLERY);

  function choosePhotoSource(onPick: (source: 'camera' | 'gallery') => void) {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: () => onPick('camera') },
      { text: 'Gallery', onPress: () => onPick('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function uploadInto(source: 'camera' | 'gallery', slot: 'main' | 'additional') {
    setUploadingSlot(slot);
    try {
      const url = await pickAndUploadProductImage(source);
      if (!url) return;
      setImages(prev => (slot === 'main' ? [url, ...prev.slice(1)] : [...prev, url]));
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err));
    } finally {
      setUploadingSlot(null);
    }
  }

  function removeGalleryImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index + 1));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await updateProduct(productId, { images });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Edit Images" onBack={() => navigation.goBack()} rightLabel="Save" onRightPress={handleSave} />
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.sectionTitle}>Main Image</Text>
          <Pressable
            style={styles.mainImage}
            disabled={uploadingSlot !== null}
            onPress={() => choosePhotoSource(source => uploadInto(source, 'main'))}
          >
            {mainImage ? (
              <Image source={{ uri: resolveAssetUrl(mainImage) }} style={styles.mainImagePhoto} resizeMode="cover" />
            ) : null}
            {uploadingSlot === 'main' ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Pressable
                style={styles.replaceButton}
                disabled={uploadingSlot !== null}
                onPress={() => choosePhotoSource(source => uploadInto(source, 'main'))}
              >
                <Icon name="image" size={16} color={colors.white} />
                <Text style={styles.replaceText}>{mainImage ? 'Replace Image' : 'Add Image'}</Text>
              </Pressable>
            )}
            {mainImage ? (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>MAIN</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View>
          <View style={styles.galleryHeaderRow}>
            <Text style={styles.sectionTitle}>
              Gallery ({galleryImages.length}/{MAX_GALLERY})
            </Text>
            <Pressable
              style={styles.addButton}
              disabled={uploadingSlot !== null || galleryImages.length >= MAX_GALLERY}
              onPress={() => choosePhotoSource(source => uploadInto(source, 'additional'))}
            >
              <Icon name="plus" size={13} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          <View style={styles.galleryGrid}>
            {Array.from({ length: MAX_GALLERY }).map((_, index) => {
              const url = galleryImages[index];
              const isNextEmptySlot = !url && index === galleryImages.length;
              return (
                <View
                  key={index}
                  style={[styles.gallerySlot, url ? styles.gallerySlotFilled : styles.gallerySlotEmpty]}
                >
                  {uploadingSlot === 'additional' && isNextEmptySlot ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : url ? (
                    <>
                      <Image source={{ uri: resolveAssetUrl(url) }} style={styles.galleryPhoto} resizeMode="cover" />
                      <View style={styles.gallerySlotActions}>
                        <Pressable
                          style={[styles.miniButton, styles.miniButtonRemove]}
                          onPress={() => removeGalleryImage(index)}
                        >
                          <Icon name="x" size={11} color={colors.white} />
                        </Pressable>
                      </View>
                    </>
                  ) : isNextEmptySlot ? (
                    <Pressable
                      style={styles.emptySlotButton}
                      disabled={uploadingSlot !== null}
                      onPress={() => choosePhotoSource(source => uploadInto(source, 'additional'))}
                    >
                      <Icon name="plus" size={22} color={colors.textTertiary} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Image Requirements</Text>
          {REQUIREMENTS.map(requirement => (
            <View key={requirement} style={styles.requirementRow}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Save Images" onPress={handleSave} loading={saving} disabled={saving || uploadingSlot !== null} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.md,
  },
  mainImage: {
    height: 180,
    borderRadius: radii.xl,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainImagePhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  replaceText: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  mainBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mainBadgeText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  galleryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gallerySlot: {
    width: 84,
    height: 88,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gallerySlotFilled: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gallerySlotEmpty: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  galleryPhoto: {
    width: '100%',
    height: '100%',
  },
  gallerySlotActions: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miniButton: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniButtonRemove: {
    backgroundColor: 'rgba(220,38,38,0.8)',
  },
  emptySlotButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementsCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  requirementsTitle: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requirementDot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  requirementText: {
    ...typography.tiny,
    color: colors.primaryDark,
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
