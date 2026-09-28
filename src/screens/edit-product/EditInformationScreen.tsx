import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, SelectField } from '../../components';
import { GST_RATE_OPTIONS } from '../../data/productOptions';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditInformation'>;

type CategoryChoice = { label: string; categoryId: string; subcategoryId: string };

export function EditInformationScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, categories, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const categoryChoices = useMemo<CategoryChoice[]>(
    () =>
      categories.flatMap(category =>
        category.subcategories.length === 0
          ? [{ label: category.name, categoryId: category.id, subcategoryId: '' }]
          : category.subcategories.map(sub => ({
              label: `${category.name} › ${sub.name}`,
              categoryId: category.id,
              subcategoryId: sub.id,
            })),
      ),
    [categories],
  );

  const initialChoice = categoryChoices.find(
    choice =>
      choice.categoryId === product?.categoryId && (choice.subcategoryId || '') === (product?.subcategoryId || ''),
  );

  const [name, setName] = useState(product?.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [categoryLabel, setCategoryLabel] = useState(initialChoice?.label ?? '');
  const [country, setCountry] = useState(product?.countryOfOrigin ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [gstLabel, setGstLabel] = useState(
    GST_RATE_OPTIONS.find(item => Number(item.value) === Number(product?.gstRate ?? '0'))?.label ?? '',
  );
  const [hsnCode, setHsnCode] = useState(product?.hsnCode ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [barcode, setBarcode] = useState(product?.barcode ?? '');
  const [reorderLevel, setReorderLevel] = useState(product?.reorderLevel ? String(product.reorderLevel) : '');
  const [maxStock, setMaxStock] = useState(product?.maxStock ? String(product.maxStock) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Edit Information" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    if (saving) return;
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the product name';
    if (hsnCode.trim() && !/^\d{4,8}$/.test(hsnCode.trim())) nextErrors.hsn = 'HSN codes are 4 to 8 digits';
    if (barcode.trim() && !/^\d{8,14}$/.test(barcode.trim())) nextErrors.barcode = 'Barcodes are 8 to 14 digits';
    if (reorderLevel && maxStock && Number(maxStock) < Number(reorderLevel)) {
      nextErrors.maxStock = 'Max stock must be at least the reorder level';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const selected = categoryChoices.find(item => item.label === categoryLabel);
    const choice =
      selected &&
      (selected.categoryId !== product!.categoryId || selected.subcategoryId !== (product!.subcategoryId || ''))
        ? selected
        : undefined;
    const gstRate = GST_RATE_OPTIONS.find(item => item.label === gstLabel)?.value;

    setSaving(true);
    try {
      await updateProduct(productId, {
        name: name.trim(),
        brand: brand.trim(),
        ...(choice ? { categoryId: choice.categoryId, subcategoryId: choice.subcategoryId } : {}),
        countryOfOrigin: country.trim(),
        description: description.trim(),
        ...(gstRate !== undefined ? { gstRate } : {}),
        hsnCode: hsnCode.trim(),
        sku: sku.trim(),
        barcode: barcode.trim(),
        reorderLevel: parseInt(reorderLevel, 10) || 0,
        maxStock: parseInt(maxStock, 10) || 0,
      });
      navigation.goBack();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors({
          name: fieldErrors.name,
          hsn: fieldErrors.hsnCode,
          barcode: fieldErrors.barcode,
          description: fieldErrors.description,
        } as Record<string, string>);
      }
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
          <Input label="Brand" value={brand} onChangeText={setBrand} />
          <SelectField
            label="Category"
            value={categoryLabel}
            options={categoryChoices.map(choice => choice.label)}
            onChange={setCategoryLabel}
            placeholder={categoryChoices.length === 0 ? 'Categories unavailable' : 'Select category'}
          />
          <Input label="Country of Origin" value={country} onChangeText={setCountry} />

          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
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
          <SelectField
            label="GST Rate"
            value={gstLabel}
            options={GST_RATE_OPTIONS.map(item => item.label)}
            onChange={setGstLabel}
            placeholder="Select GST rate"
          />
          <Input
            label="HSN Code"
            value={hsnCode}
            onChangeText={text => setHsnCode(text.replace(/[^0-9]/g, ''))}
            leftIcon="hash"
            keyboardType="number-pad"
            maxLength={8}
            error={errors.hsn}
          />
        </View>

        <View style={styles.card}>
          <Input
            label="SKU Code"
            value={sku}
            onChangeText={text => setSku(text.toUpperCase())}
            autoCapitalize="characters"
            leftIcon="hash"
          />
          <Input
            label="Barcode Number"
            value={barcode}
            onChangeText={text => setBarcode(text.replace(/[^0-9]/g, ''))}
            leftIcon="barcode"
            keyboardType="number-pad"
            maxLength={14}
            error={errors.barcode}
          />
        </View>

        <View style={styles.card}>
          <Input
            label="Reorder Level"
            value={reorderLevel}
            onChangeText={text => setReorderLevel(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            helperText="You get a low-stock alert when stock falls to this level"
          />
          <Input
            label="Max Stock"
            value={maxStock}
            onChangeText={text => setMaxStock(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            error={errors.maxStock}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={saving} disabled={saving} />
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
