import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { pickAndUploadLogo } from '../../services/storeSetupUpload';
import { getApiErrorMessage } from '../../services/api';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreLogoUpload'>;

const REQUIREMENTS = [
  'Minimum 400×400 px (square)',
  'PNG or JPG format',
  'Max file size: 2 MB',
  'Transparent or white background preferred',
];

const SOURCES: { icon: IconName; label: string; source: 'camera' | 'gallery' }[] = [
  { icon: 'camera', label: 'Camera', source: 'camera' },
  { icon: 'image', label: 'Gallery', source: 'gallery' },
];

export function StoreLogoUploadScreen({ navigation }: Props) {
  const { data, setLogoUploaded } = useStoreSetup();
  const storeName = data.profile?.storeName ?? 'Your Store';
  const previewMeta = [
    data.profile?.primaryCategory,
    data.profile?.avgPrepTime ? `${data.profile.avgPrepTime} min` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  const [uploading, setUploading] = useState(false);

  async function handlePick(source: 'camera' | 'gallery') {
    setUploading(true);
    try {
      const url = await pickAndUploadLogo(source);
      if (url) setLogoUploaded(true, url);
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
          <Text style={styles.heading}>Store Logo</Text>
          <Text style={styles.subtitle}>
            Your logo appears on search results, store page, and order receipts
          </Text>
        </View>

        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {uploading ? (
                <ActivityIndicator color={colors.white} />
              ) : data.logoUrl ? (
                <Image source={{ uri: resolveAssetUrl(data.logoUrl) }} style={styles.avatarImage} />
              ) : (
                <Icon name="home" size={52} color={colors.white} />
              )}
            </View>
            <Pressable style={styles.editBadge} onPress={() => handlePick('gallery')}>
              <Icon name="edit" size={16} color={colors.white} />
            </Pressable>
          </View>
          {data.logoUploaded ? (
            <View style={styles.uploadedRow}>
              <Icon name="check-circle" size={13} color={colors.primary} />
              <Text style={styles.uploadedText}>Logo uploaded</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Preview — Store Card</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewAvatar}>
              {data.logoUrl ? (
                <Image source={{ uri: resolveAssetUrl(data.logoUrl) }} style={styles.avatarImage} />
              ) : (
                <Icon name="home" size={22} color={colors.white} />
              )}
            </View>
            <View style={styles.previewTextColumn}>
              <Text style={styles.previewName}>{storeName}</Text>
              {previewMeta ? <Text style={styles.previewMeta}>{previewMeta}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Logo</Text>
          <View style={styles.sourcesRow}>
            {SOURCES.map(source => (
              <Pressable
                key={source.label}
                style={styles.sourceButton}
                disabled={uploading}
                onPress={() => handlePick(source.source)}
              >
                <Icon name={source.icon} size={20} color={colors.primary} />
                <Text style={styles.sourceLabel}>{source.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Logo Requirements</Text>
          {REQUIREMENTS.map(requirement => (
            <View key={requirement} style={styles.requirementRow}>
              <Icon name="check" size={12} color={colors.textSecondary} strokeWidth={2.5} />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            label="Save & Continue"
            disabled={!data.logoUploaded}
            onPress={() => navigation.navigate('StoreCoverImage')}
          />
          {!data.logoUploaded ? <Text style={styles.requiredHint}>Upload a logo to continue</Text> : null}
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
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadedText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  previewCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  previewAvatar: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewTextColumn: {
    flex: 1,
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
  sourcesRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  sourceButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
  },
  sourceLabel: {
    ...typography.tinyBold,
    color: colors.primary,
    fontFamily: fontFamilies.medium,
  },
  requirementsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  requirementsTitle: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requirementText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  requiredHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
