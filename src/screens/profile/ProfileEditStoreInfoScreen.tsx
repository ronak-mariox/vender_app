import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { isRequired, type FormErrors } from '../../utils/validators';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileEditStoreInfo'>;

type Errors = FormErrors<'storeName' | 'category' | 'contactNumber'>;

const DESCRIPTION_MAX_LENGTH = 150;

export function ProfileEditStoreInfoScreen({ navigation }: Props) {
  const { profile, updateProfileBasics, updateStoreInfo, updateStoreLogo, updateStoreCover } = useProfile();
  const { store } = profile;

  const [storeName, setStoreName] = useState(profile.storeName);
  const [category, setCategory] = useState(store.category);
  const [subCategory, setSubCategory] = useState(store.subCategory);
  const [tags, setTags] = useState(store.tags.join(', '));
  const [description, setDescription] = useState(store.description);
  const [contactNumber, setContactNumber] = useState(store.contactNumber);
  const [minimumOrderValue, setMinimumOrderValue] = useState(
    store.minimumOrderValue != null ? String(store.minimumOrderValue) : '',
  );
  const [avgPrepTime, setAvgPrepTime] = useState(store.avgPrepTime != null ? String(store.avgPrepTime) : '');
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  async function handleChangeLogo() {
    if (isUploadingLogo) return;
    setIsUploadingLogo(true);
    try {
      await updateStoreLogo('gallery');
    } catch {
      setErrors(prev => ({ ...prev, form: 'Could not update logo — please try again.' }));
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function handleChangeCover() {
    if (isUploadingCover) return;
    setIsUploadingCover(true);
    try {
      await updateStoreCover('gallery');
    } catch {
      setErrors(prev => ({ ...prev, form: 'Could not update cover image — please try again.' }));
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleSave() {
    if (isSaving) return;
    const nextErrors: Errors = {};
    if (!isRequired(storeName)) nextErrors.storeName = 'Required';
    if (!isRequired(category)) nextErrors.category = 'Required';
    if (!isRequired(contactNumber)) nextErrors.contactNumber = 'Required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateProfileBasics({ storeName: storeName.trim() });
      await updateStoreInfo({
        category: category.trim(),
        subCategory: subCategory.trim(),
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        description: description.trim(),
        contactNumber: contactNumber.trim(),
        minimumOrderValue: minimumOrderValue.trim() ? Number(minimumOrderValue) : null,
        avgPrepTime: avgPrepTime.trim() ? Number(avgPrepTime) : null,
      });
      navigation.goBack();
    } catch {
      setErrors({ form: 'Could not save store details — please check your connection and try again.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Edit Store Information" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Store Logo</Text>
              <View style={styles.logoRow}>
                <Pressable style={styles.logoBox} onPress={handleChangeLogo} disabled={isUploadingLogo}>
                  {isUploadingLogo ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : store.logoUrl ? (
                    <Image source={{ uri: resolveAssetUrl(store.logoUrl) }} style={styles.logoImage} />
                  ) : (
                    <Icon name="camera" size={20} color={colors.textPrimary} />
                  )}
                </Pressable>
                <Pressable onPress={handleChangeLogo} disabled={isUploadingLogo} hitSlop={8}>
                  <Text style={styles.mediaLink}>Change Logo</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Cover Image</Text>
              <Pressable style={styles.coverBox} onPress={handleChangeCover} disabled={isUploadingCover}>
                {isUploadingCover ? (
                  <ActivityIndicator color={colors.primary} />
                ) : store.coverImageUrl ? (
                  <Image source={{ uri: resolveAssetUrl(store.coverImageUrl) }} style={styles.coverImage} />
                ) : (
                  <>
                    <Icon name="camera" size={20} color={colors.textPrimary} />
                    <Text style={styles.mediaLinkSmall}>Change Cover</Text>
                  </>
                )}
              </Pressable>
            </View>

            <Input
              label="Store Name"
              required
              value={storeName}
              onChangeText={text => {
                setStoreName(text);
                if (errors.storeName) setErrors(prev => ({ ...prev, storeName: undefined }));
              }}
              error={errors.storeName}
            />
            <Input
              label="Category"
              required
              value={category}
              onChangeText={text => {
                setCategory(text);
                if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
              }}
              error={errors.category}
            />
            <Input label="Sub-category" value={subCategory} onChangeText={setSubCategory} placeholder="Optional" />
            <Input
              label="Tags"
              value={tags}
              onChangeText={setTags}
              placeholder="Comma-separated, e.g. organic, bakery"
            />

            <View style={styles.fieldGroup}>
              <View style={styles.descriptionHeaderRow}>
                <Text style={styles.fieldLabel}>Store Description</Text>
                <Text style={styles.charCount}>
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.textarea}
                value={description}
                onChangeText={text => setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH))}
                placeholder="Describe your store..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                maxLength={DESCRIPTION_MAX_LENGTH}
                textAlignVertical="top"
              />
            </View>

            <Input
              label="Contact Number"
              required
              value={contactNumber}
              onChangeText={text => {
                setContactNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
                if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: undefined }));
              }}
              keyboardType="number-pad"
              error={errors.contactNumber}
            />
            <Input
              label="Minimum Order Value"
              value={minimumOrderValue}
              onChangeText={text => setMinimumOrderValue(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Optional"
            />
            <Input
              label="Average Prep Time (minutes)"
              value={avgPrepTime}
              onChangeText={text => setAvgPrepTime(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Optional"
            />

            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={isSaving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  mediaLink: {
    ...typography.label,
    color: colors.primary,
  },
  mediaLinkSmall: {
    ...typography.caption,
    color: colors.primary,
  },
  coverBox: {
    width: '100%',
    height: 80,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  descriptionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  textarea: {
    ...typography.body,
    color: colors.textPrimary,
    height: 84,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
