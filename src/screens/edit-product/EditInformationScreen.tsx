import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, SelectField } from '../../components';
import { CATEGORIES } from '../../data/categories';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditInformation'>;

const CATEGORY_OPTIONS = CATEGORIES.flatMap(category =>
  category.subcategories.map(subcategory => `${category.name} › ${subcategory.name}`),
);

function findCategoryOption(categoryName: string, subcategoryName: string) {
  return `${categoryName} › ${subcategoryName}`;
}

function parseCategoryOption(option: string) {
  const [categoryName, subcategoryName] = option.split(' › ');
  const category = CATEGORIES.find(item => item.name === categoryName);
  const subcategory = category?.subcategories.find(item => item.name === subcategoryName);
  return { category, subcategory };
}

export function EditInformationScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [categoryOption, setCategoryOption] = useState(
    product ? findCategoryOption(product.categoryName, product.subcategoryName) : '',
  );
  const [packSize, setPackSize] = useState(product?.packSize ?? '');
  const [country, setCountry] = useState(product?.countryOfOrigin ?? 'India');
  const [description, setDescription] = useState(product?.description ?? '');
  const [hsnCode, setHsnCode] = useState(product?.hsnCode ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const hsnError = useMemo(() => {
    if (!hsnCode.trim()) return undefined;
    if (!/^\d{4,8}$/.test(hsnCode.trim())) {
      return `HSN code must be 4–8 digits. "${hsnCode.trim()}" is incomplete.`;
    }
    return undefined;
  }, [hsnCode]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Information" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the product name';
    if (!brand.trim()) nextErrors.brand = 'Enter the brand';
    if (!packSize.trim()) nextErrors.packSize = 'Enter the pack size';
    if (!country.trim()) nextErrors.country = 'Enter country of origin';
    if (!description.trim()) nextErrors.description = 'Enter a description';
    if (!hsnCode.trim()) nextErrors.hsn = 'Enter the HSN code';
    else if (hsnError) nextErrors.hsn = hsnError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (saving) return;

    const { category, subcategory } = parseCategoryOption(categoryOption);

    setSaving(true);
    try {
      await updateProduct(productId, {
        name: name.trim(),
        brand: brand.trim(),
        categoryId: category?.id ?? product!.categoryId,
        categoryName: category?.name ?? product!.categoryName,
        subcategoryId: subcategory?.id ?? product!.subcategoryId,
        subcategoryName: subcategory?.name ?? product!.subcategoryName,
        packSize: packSize.trim(),
        countryOfOrigin: country.trim(),
        description: description.trim(),
        hsnCode: hsnCode.trim(),
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader
        title="Edit Information"
        onBack={() => navigation.goBack()}
        rightLabel="Save"
        onRightPress={handleSave}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Input label="Product Name" required value={name} onChangeText={setName} error={errors.name} />
          <Input label="Brand" required value={brand} onChangeText={setBrand} error={errors.brand} />
          <SelectField
            label="Category"
            value={categoryOption}
            options={CATEGORY_OPTIONS}
            onChange={setCategoryOption}
            placeholder="Select category"
          />
          <Input
            label="Pack Size"
            required
            value={packSize}
            onChangeText={setPackSize}
            error={errors.packSize}
          />
          <Input
            label="Country of Origin"
            required
            value={country}
            onChangeText={setCountry}
            error={errors.country}
          />

          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.textarea, errors.description && styles.textareaError]}>
              <TextInput
                value={description}
                onChangeText={text => {
                  if (text.length <= 2000) setDescription(text);
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder="Describe the product"
                placeholderTextColor={colors.textTertiary}
                style={styles.textareaInput}
                multiline
              />
            </View>
            <View style={styles.textareaFooter}>
              <Text style={errors.description ? styles.errorText : styles.helperText}>
                {errors.description ?? ' '}
              </Text>
              <Text style={styles.counterText}>{description.length} / 2000</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Input
            label="HSN Code"
            required
            value={hsnCode}
            onChangeText={setHsnCode}
            leftIcon="hash"
            keyboardType="number-pad"
            error={errors.hsn ?? hsnError}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} />
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
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
  textarea: {
    minHeight: 100,
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
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.tiny,
    color: colors.error,
    flex: 1,
  },
  counterText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
