import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FileCard, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { pickAndUploadCoverImage } from '../../services/storeSetupUpload';
import { getApiErrorMessage } from '../../services/api';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreCoverImage'>;

export function StoreCoverImageScreen({ navigation }: Props) {
  const { data, setCoverImageUploaded } = useStoreSetup();
  const storeName = data.profile?.storeName ?? 'Your Store';
  const [uploading, setUploading] = useState(false);
  const coverImageUri = data.coverImageUrl ? resolveAssetUrl(data.coverImageUrl) : undefined;

  async function handlePick(source: 'camera' | 'gallery') {
    setUploading(true);
    try {
      const url = await pickAndUploadCoverImage(source);
      if (url) setCoverImageUploaded(true, url);
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={2} totalSteps={7} label="Store Branding" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Cover Image</Text>
          <Text style={styles.subtitle}>A banner image displayed at the top of your store page</Text>
        </View>

        <View style={styles.coverBanner}>
          {coverImageUri ? (
            <Image source={{ uri: coverImageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <LinearGradient
            colors={
              coverImageUri
                ? ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.35)']
                : ['#1A4A1A', colors.primary, '#6EC97C']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.coverContent}>
            <Text style={styles.coverTitle}>{storeName}</Text>
            {data.profile?.primaryCategory ? (
              <Text style={styles.coverSubtitle}>{data.profile.primaryCategory}</Text>
            ) : null}
          </View>
          <Pressable style={styles.coverEditButton} disabled={uploading} onPress={() => handlePick('gallery')}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="edit" size={13} color={colors.white} />
                <Text style={styles.coverEditText}>Edit</Text>
              </>
            )}
          </Pressable>
          <View style={styles.coverDimensionChip}>
            <Text style={styles.coverDimensionText}>1200 × 400 px</Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Store Page Preview</Text>
          <View style={styles.previewBanner}>
            {coverImageUri ? (
              <Image source={{ uri: coverImageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['#1A4A1A', colors.primary, '#6EC97C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.previewAvatar}>
              {data.logoUrl ? (
                <Image source={{ uri: resolveAssetUrl(data.logoUrl) }} style={styles.previewAvatarImage} />
              ) : (
                <Icon name="home" size={20} color={colors.white} />
              )}
            </View>
          </View>
          <View style={styles.previewTextBlock}>
            <Text style={styles.previewName}>{storeName}</Text>
            {data.profile?.primaryCategory ? (
              <Text style={styles.previewMeta}>{data.profile.primaryCategory}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Cover</Text>
          {data.coverImageUploaded ? (
            <FileCard
              fileName="Cover image uploaded"
              thumbnailUri={coverImageUri}
              onReplace={() => handlePick('gallery')}
            />
          ) : (
            <Button
              label="Upload Cover Image"
              variant="outline"
              loading={uploading}
              onPress={() => handlePick('gallery')}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Button
            label="Save & Continue"
            disabled={!data.coverImageUploaded}
            onPress={() => navigation.navigate('StoreAddress')}
          />
          {!data.coverImageUploaded ? <Text style={styles.requiredHint}>Upload a cover image to continue</Text> : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xxs,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  coverBanner: {
    height: 141,
    borderRadius: radii.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContent: {
    alignItems: 'center',
  },
  coverTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
  },
  coverSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    paddingTop: 4,
  },
  coverEditButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  coverEditText: {
    ...typography.caption,
    color: colors.white,
  },
  coverDimensionChip: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coverDimensionText: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.8)',
  },
  previewCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  previewBanner: {
    height: 90,
    justifyContent: 'flex-end',
  },
  previewAvatar: {
    position: 'absolute',
    left: 16,
    bottom: -22,
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  previewTextBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: 28,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  previewName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  previewMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  requiredHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
