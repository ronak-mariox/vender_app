import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductBasicInfo'>;

const MANUFACTURER_OPTIONS = [
  'Tata Consumer Products Ltd.',
  'Hindustan Unilever Ltd.',
  'ITC Ltd.',
  'Nestlé India Ltd.',
  'Amul (GCMMF)',
  'Other',
];

export function ProductBasicInfoScreen({ navigation }: Props) {
  const { draft, updateBasicInfo } = useProductDraft();
  const [name, setName] = useState(draft.basicInfo?.name ?? '');
  const [brand, setBrand] = useState(draft.basicInfo?.brand ?? '');
  const [manufacturer, setManufacturer] = useState(draft.basicInfo?.manufacturer ?? '');
  const [country, setCountry] = useState(draft.basicInfo?.countryOfOrigin ?? 'India');
  const [shortDescription, setShortDescription] = useState(draft.basicInfo?.shortDescription ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      if (draft.basicInfo?.brand) {
        setBrand(draft.basicInfo.brand);
      }
    }, [draft.basicInfo?.brand]),
  );

  function handleContinue() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the product name';
    if (!brand.trim()) nextErrors.brand = 'Select a brand';
    if (!country.trim()) nextErrors.country = 'Enter country of origin';
    if (!shortDescription.trim()) nextErrors.shortDescription = 'Enter a short description';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateBasicInfo({
      name: name.trim(),
      brand: brand.trim(),
      manufacturer,
      countryOfOrigin: country.trim(),
      shortDescription: shortDescription.trim(),
    });
    navigation.navigate('ProductImages');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Basic Information"
        currentStep={1}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSectionCard>
          <Input
            label="Product Name"
            required
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tata Salt Vacuum Evaporated Iodised"
            error={errors.name}
            helperText={errors.name ? undefined : 'Use the full product name as on packaging'}
          />

          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Brand</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <Pressable
              style={[styles.brandField, errors.brand && styles.brandFieldError]}
              onPress={() => navigation.navigate('BrandPicker')}
            >
              <Text style={[styles.brandFieldText, !brand && styles.brandFieldPlaceholder]} numberOfLines={1}>
                {brand || 'Select or type brand name'}
              </Text>
              <Icon name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
            <Text style={errors.brand ? styles.errorText : styles.helperText}>
              {errors.brand ?? 'Select or type brand name'}
            </Text>
          </View>

          <SelectField
            label="Manufacturer"
            value={manufacturer}
            options={MANUFACTURER_OPTIONS}
            onChange={setManufacturer}
            placeholder="Select manufacturer"
          />

          <Input
            label="Country of Origin"
            required
            value={country}
            onChangeText={setCountry}
            placeholder="India"
            error={errors.country}
          />
        </FormSectionCard>

        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Short Description</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View
              style={[
                styles.textarea,
                errors.shortDescription && styles.textareaError,
              ]}
            >
              <TextInput
                value={shortDescription}
                onChangeText={text => text.length <= 200 && setShortDescription(text)}
                placeholder="One or two lines describing the product"
                placeholderTextColor={colors.textTertiary}
                style={styles.textareaInput}
                multiline
              />
            </View>
            <View style={styles.textareaFooter}>
              {errors.shortDescription ? (
                <Text style={styles.errorText}>{errors.shortDescription}</Text>
              ) : (
                <View />
              )}
              <Text style={styles.counterText}>{shortDescription.length} / 200</Text>
            </View>
          </View>
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
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
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  brandField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  brandFieldError: {
    borderColor: colors.error,
  },
  brandFieldText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  brandFieldPlaceholder: {
    color: colors.textTertiary,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  textarea: {
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  textareaError: {
    borderColor: colors.error,
  },
  textareaInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    textAlignVertical: 'top',
  },
  textareaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  counterText: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
