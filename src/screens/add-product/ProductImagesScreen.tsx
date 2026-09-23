import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { pickAndUploadProductImage } from '../../services/productImageUpload';
import { getApiErrorMessage } from '../../services/api';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductImages'>;

const MAX_ADDITIONAL = 4;

const TIPS = [
  'White or plain background preferred',
  'Show all sides of the product',
  'Include packaging and label clearly',
  'Avoid blurry or low-light images',
];

export function ProductImagesScreen({ navigation }: Props) {
  const { draft, updateImages } = useProductDraft();
  const [images, setImages] = useState<string[]>(draft.images.images);
  const [uploadingSlot, setUploadingSlot] = useState<'main' | 'additional' | null>(null);
  const [error, setError] = useState<string | undefined>();

  const mainImage = images[0];
  const additionalImages = images.slice(1, 1 + MAX_ADDITIONAL);

  function choosePhotoSource(onPick: (source: 'camera' | 'gallery') => void) {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: () => onPick('camera') },
      { text: 'Gallery', onPress: () => onPick('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function uploadInto(source: 'camera' | 'gallery', slot: 'main' | 'additional') {
    if (slot === 'additional' && additionalImages.length >= MAX_ADDITIONAL) {
      setError(`You can add up to ${MAX_ADDITIONAL} additional images`);
      return;
    }
    setUploadingSlot(slot);
    try {
      const url = await pickAndUploadProductImage(source);
      if (!url) return;
      setError(undefined);
      setImages(prev => (slot === 'main' ? [url, ...prev.slice(1)] : [...prev, url]));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploadingSlot(null);
    }
  }

  function removeMain() {
    setImages(prev => prev.slice(1));
  }

  function removeAdditional(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index + 1));
  }

  function handleContinue() {
    if (!mainImage) {
      setError('Add a main product image to continue');
      return;
    }
    updateImages({ images });
    navigation.navigate('ProductCategoryStep');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Product Images"
        currentStep={2}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Upload clear, high-quality product images. First image will be the main display photo.
        </Text>

        <View style={styles.blockGap}>
          <Text style={styles.sectionTitle}>Main Image</Text>
          <Pressable
            style={[styles.mainDropzone, mainImage && styles.mainDropzoneFilled]}
            disabled={uploadingSlot !== null}
            onPress={() => choosePhotoSource(source => uploadInto(source, 'main'))}
          >
            {uploadingSlot === 'main' ? (
              <ActivityIndicator color={colors.primary} />
            ) : mainImage ? (
              <>
                <Image source={{ uri: resolveAssetUrl(mainImage) }} style={styles.mainFilledPreview} resizeMode="cover" />
                <Pressable style={styles.removeMainButton} onPress={removeMain} hitSlop={8}>
                  <Icon name="x" size={11} color={colors.white} />
                </Pressable>
              </>
            ) : (
              <View style={styles.dropzoneContent}>
                <View style={styles.dropzoneIcon}>
                  <Icon name="camera" size={24} color={colors.primary} />
                </View>
                <Text style={styles.dropzoneTitle}>Tap to add main image</Text>
                <Text style={styles.dropzoneMeta}>JPG, PNG · Min 800×800px</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.blockGap}>
          <View style={styles.additionalHeaderRow}>
            <Text style={styles.sectionTitle}>Additional Images ({additionalImages.length}/{MAX_ADDITIONAL})</Text>
            <Text style={styles.maxText}>Max {MAX_ADDITIONAL} images</Text>
          </View>
          <View style={styles.additionalGrid}>
            {Array.from({ length: MAX_ADDITIONAL }).map((_, index) => {
              const url = additionalImages[index];
              const isNextEmptySlot = !url && index === additionalImages.length;
              return (
                <Pressable
                  key={index}
                  style={[styles.additionalSlot, url ? styles.additionalSlotFilled : styles.additionalSlotEmpty]}
                  disabled={uploadingSlot !== null || (!url && !isNextEmptySlot)}
                  onPress={() => {
                    if (!url && isNextEmptySlot) {
                      choosePhotoSource(source => uploadInto(source, 'additional'));
                    }
                  }}
                >
                  {uploadingSlot === 'additional' && isNextEmptySlot ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : url ? (
                    <>
                      <Image source={{ uri: resolveAssetUrl(url) }} style={styles.additionalImage} resizeMode="cover" />
                      <Pressable
                        style={styles.removeAdditionalButton}
                        onPress={() => removeAdditional(index)}
                        hitSlop={8}
                      >
                        <Icon name="x" size={11} color={colors.white} />
                      </Pressable>
                    </>
                  ) : isNextEmptySlot ? (
                    <Icon name="plus" size={22} color={colors.textTertiary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          {TIPS.map(tip => (
            <View key={tip} style={styles.tipRow}>
              <Icon name="check" size={11} color={colors.primaryDark} strokeWidth={3} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} disabled={uploadingSlot !== null} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  intro: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  blockGap: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  mainDropzone: {
    height: 180,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainDropzoneFilled: {
    borderStyle: 'solid',
  },
  dropzoneContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  dropzoneIcon: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  dropzoneMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  mainFilledPreview: {
    width: '100%',
    height: '100%',
  },
  removeMainButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  additionalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  additionalSlot: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  additionalSlotEmpty: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  additionalSlotFilled: {
    backgroundColor: '#D1D5DB',
    borderWidth: 1,
    borderColor: colors.border,
  },
  additionalImage: {
    width: '100%',
    height: '100%',
  },
  removeAdditionalButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 9999,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tipsTitle: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipText: {
    ...typography.tiny,
    color: colors.primaryDark,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
