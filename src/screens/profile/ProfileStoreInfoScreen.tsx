import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile } from '../../context/ProfileContext';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileStoreInfo'>;

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
        {value || '—'}
      </Text>
    </View>
  );
}

export function ProfileStoreInfoScreen({ navigation }: Props) {
  const { profile, updateStoreLogo, updateStoreCover } = useProfile();
  const { store } = profile;
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  async function handleChangeCover() {
    if (isUploadingCover) return;
    setIsUploadingCover(true);
    try {
      await updateStoreCover('gallery');
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleChangeLogo() {
    if (isUploadingLogo) return;
    setIsUploadingLogo(true);
    try {
      await updateStoreLogo('gallery');
    } finally {
      setIsUploadingLogo(false);
    }
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Store Information" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.coverPlaceholder} onPress={handleChangeCover} disabled={isUploadingCover}>
          {store.coverImageUrl ? (
            <Image source={{ uri: resolveAssetUrl(store.coverImageUrl) }} style={styles.coverImage} />
          ) : (
            <>
              <Icon name="camera" size={32} color={colors.textSecondary} />
              <Text style={styles.coverPlaceholderText}>Add Cover Photo</Text>
            </>
          )}
          <View style={styles.changePill}>
            {isUploadingCover ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.changePillText}>Change</Text>
            )}
          </View>
        </Pressable>

        <View style={styles.logoRow}>
          <Pressable style={styles.logoBox} onPress={handleChangeLogo} disabled={isUploadingLogo}>
            {isUploadingLogo ? (
              <ActivityIndicator color={colors.primary} />
            ) : store.logoUrl ? (
              <Image source={{ uri: resolveAssetUrl(store.logoUrl) }} style={styles.logoImage} />
            ) : (
              <Icon name="camera" size={20} color={colors.textSecondary} />
            )}
          </Pressable>
          <Text style={styles.logoLabel}>Store Logo</Text>
        </View>

        <View style={styles.card}>
          <InfoRow label="Store Name" value={profile.storeName} />
          <InfoRow label="Category" value={store.category} />
          <InfoRow label="Sub-category" value={store.subCategory} />
          <InfoRow label="Tags" value={store.tags.join(', ')} />
          <InfoRow label="Contact Number" value={store.contactNumber} />
          <InfoRow label="Min. Order Value" value={store.minimumOrderValue != null ? `₹${store.minimumOrderValue}` : ''} />
          <InfoRow label="Avg. Prep Time" value={store.avgPrepTime != null ? `${store.avgPrepTime} min` : ''} />
          <InfoRow label="Description" value={store.description} last />
        </View>

        <View style={styles.buttonWrapper}>
          <Button label="Edit Store Details" onPress={() => navigation.navigate('ProfileEditStoreInfo')} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    paddingBottom: spacing.xxxl,
  },
  coverPlaceholder: {
    height: 160,
    width: '100%',
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverPlaceholderText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  changePill: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 56,
    alignItems: 'center',
  },
  changePillText: {
    ...typography.tiny,
    color: colors.white,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    marginTop: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonWrapper: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
