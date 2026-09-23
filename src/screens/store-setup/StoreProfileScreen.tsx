import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { useRegistration } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { isPositiveNumber, isRequired, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreProfile'>;

type Errors = FormErrors<
  'storeName' | 'description' | 'primaryCategory' | 'subCategory' | 'tags' | 'minimumOrderValue' | 'avgPrepTime'
>;

const CATEGORIES = ['Grocery & Essentials', 'Electronics', 'Fashion', 'Health & Beauty', 'Home & Kitchen'];
const SUB_CATEGORIES = ['Kirana / General Store', 'Supermarket', 'Organic Store', 'Wholesale'];
const DESCRIPTION_MAX = 250;

export function StoreProfileScreen({ navigation }: Props) {
  const { data, updateProfile } = useStoreSetup();
  const { data: registrationData } = useRegistration();

  const [storeName, setStoreName] = useState(
    data.profile?.storeName ?? registrationData.storeInfo?.storeName ?? '',
  );
  const [description, setDescription] = useState(
    data.profile?.description ??
      'Fresh grocery and daily essentials delivered to your doorstep. Quality products at the best prices — from vegetables to packaged goods.',
  );
  const [primaryCategory, setPrimaryCategory] = useState(
    data.profile?.primaryCategory ?? registrationData.businessInfo?.category ?? '',
  );
  const [subCategory, setSubCategory] = useState(data.profile?.subCategory ?? '');
  const [tags, setTags] = useState<string[]>(() =>
    Array.from(new Set(data.profile?.tags ?? ['Grocery', 'Fresh Produce', 'Daily Essentials', 'Home Delivery'])),
  );
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const committingTagRef = useRef(false);
  const [minimumOrderValue, setMinimumOrderValue] = useState(data.profile?.minimumOrderValue ?? '150');
  const [avgPrepTime, setAvgPrepTime] = useState(data.profile?.avgPrepTime ?? '30');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function removeTag(tag: string) {
    setTags(prev => prev.filter(item => item !== tag));
  }

  function commitTag() {
    if (committingTagRef.current) return;
    committingTagRef.current = true;
    const trimmed = newTag.trim();
    setTags(prev => (trimmed && !prev.includes(trimmed) ? [...prev, trimmed] : prev));
    if (trimmed) setErrors(prev => (prev.tags ? { ...prev, tags: undefined } : prev));
    setNewTag('');
    setAddingTag(false);
  }

  function startAddingTag() {
    committingTagRef.current = false;
    setAddingTag(true);
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isRequired(storeName)) nextErrors.storeName = 'Store name is required';
    if (!isRequired(description)) nextErrors.description = 'Store description is required';
    if (!isRequired(primaryCategory)) nextErrors.primaryCategory = 'Select a primary category';
    if (!isRequired(subCategory)) nextErrors.subCategory = 'Select a sub-category';
    if (tags.length === 0) nextErrors.tags = 'Add at least one tag';
    if (!isPositiveNumber(minimumOrderValue)) nextErrors.minimumOrderValue = 'Enter a valid amount';
    if (!isPositiveNumber(avgPrepTime)) nextErrors.avgPrepTime = 'Enter a valid duration';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const profile = {
      storeName: storeName.trim(),
      description: description.trim(),
      primaryCategory,
      subCategory,
      tags,
      minimumOrderValue,
      avgPrepTime,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/profile', profile);
      updateProfile(profile);
      navigation.navigate('StoreLogoUpload');
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={1} totalSteps={7} label="Store Profile" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Store Profile</Text>
          <Text style={styles.subtitle}>This is how customers discover and recognise your store</Text>
        </View>

        <FormSectionCard title="Basic Details">
          <Input
            label="Store Name"
            required
            value={storeName}
            onChangeText={text => {
              setStoreName(text);
              if (errors.storeName) setErrors(prev => ({ ...prev, storeName: undefined }));
            }}
            placeholder="Sharma Kirana Store"
            helperText="Displayed to customers on Verdant"
            error={errors.storeName}
          />

          <View style={styles.gap}>
            <Text style={styles.label}>
              Store Description <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.textareaWrapper, errors.description ? styles.textareaError : null]}>
              <TextInput
                style={styles.textarea}
                value={description}
                onChangeText={text => {
                  setDescription(text.slice(0, DESCRIPTION_MAX));
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                multiline
                textAlignVertical="top"
                placeholder="Tell customers about your store"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            <Text style={styles.charCount}>
              {description.length} / {DESCRIPTION_MAX}
            </Text>
          </View>

          <SelectField
            label="Primary Category"
            required
            value={primaryCategory}
            options={CATEGORIES}
            onChange={value => {
              setPrimaryCategory(value);
              if (errors.primaryCategory) setErrors(prev => ({ ...prev, primaryCategory: undefined }));
            }}
            error={errors.primaryCategory}
          />
          <SelectField
            label="Sub-category"
            required
            value={subCategory}
            options={SUB_CATEGORIES}
            onChange={value => {
              setSubCategory(value);
              if (errors.subCategory) setErrors(prev => ({ ...prev, subCategory: undefined }));
            }}
            error={errors.subCategory}
          />
        </FormSectionCard>

        <FormSectionCard title="Store Tags">
          <View style={styles.tagsRow}>
            {tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <Pressable onPress={() => removeTag(tag)} hitSlop={6}>
                  <Icon name="x" size={12} color={colors.primaryDark} strokeWidth={2.5} />
                </Pressable>
              </View>
            ))}
            {addingTag ? (
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={commitTag}
                onBlur={commitTag}
                blurOnSubmit={false}
                autoFocus
                placeholder="Tag name"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Pressable style={styles.addTagButton} onPress={startAddingTag}>
                <Icon name="plus" size={12} color={colors.textSecondary} />
                <Text style={styles.addTagText}>Add tag</Text>
              </Pressable>
            )}
          </View>
          {errors.tags ? (
            <Text style={styles.errorText}>{errors.tags}</Text>
          ) : (
            <Text style={styles.helperText}>Tags help customers find your store in search results</Text>
          )}
        </FormSectionCard>

        <FormSectionCard title="Order Settings">
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="Minimum Order Value"
                value={minimumOrderValue}
                onChangeText={text => {
                  setMinimumOrderValue(text.replace(/[^0-9]/g, ''));
                  if (errors.minimumOrderValue) setErrors(prev => ({ ...prev, minimumOrderValue: undefined }));
                }}
                keyboardType="number-pad"
                placeholder="150"
                error={errors.minimumOrderValue}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="Avg. Prep Time (min)"
                value={avgPrepTime}
                onChangeText={text => {
                  setAvgPrepTime(text.replace(/[^0-9]/g, ''));
                  if (errors.avgPrepTime) setErrors(prev => ({ ...prev, avgPrepTime: undefined }));
                }}
                keyboardType="number-pad"
                placeholder="30"
                error={errors.avgPrepTime}
              />
            </View>
          </View>
        </FormSectionCard>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={handleContinue} loading={saving} />
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
  gap: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  textareaWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  textareaError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  textarea: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 80,
    padding: 0,
  },
  charCount: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primaryDark,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addTagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tagInput: {
    ...typography.caption,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 90,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rowItem: {
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
