import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { STOCK_REASONS } from '../../utils/inventory';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StockAdjustment'>;

const ADJUSTMENT_TYPES = ['Add Stock (Incoming)', 'Remove Stock (Outgoing)', 'Set Exact Count'];

export function StockAdjustmentScreen({ navigation, route }: Props) {
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();

  const initialProduct = products.find(item => item.id === route.params?.productId) ?? products[0];
  const [productName, setProductName] = useState(initialProduct?.name ?? '');
  const [adjustmentType, setAdjustmentType] = useState(ADJUSTMENT_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(STOCK_REASONS[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const product = useMemo(() => products.find(item => item.name === productName), [products, productName]);
  const qtyNumber = parseInt(quantity, 10) || 0;

  const afterStock = useMemo(() => {
    if (!product) return 0;
    if (adjustmentType === 'Add Stock (Incoming)') return product.stock + qtyNumber;
    if (adjustmentType === 'Remove Stock (Outgoing)') return Math.max(0, product.stock - qtyNumber);
    return qtyNumber;
  }, [product, adjustmentType, qtyNumber]);

  async function handleSave() {
    if (!product) {
      setError('Select a product');
      return;
    }
    if (!quantity.trim() || qtyNumber < 0) {
      setError('Enter a valid quantity');
      return;
    }
    setError(undefined);
    if (saving) return;
    setSaving(true);
    try {
      const result = await recordStockChange({
        productId: product.id,
        newStock: afterStock,
        reason,
        type: adjustmentType === 'Add Stock (Incoming)' ? 'purchase' : 'adjustment',
        reference: reference.trim() || undefined,
      });
      if (result?.wentOutOfStock) {
        navigation.replace('OOSConfirmation', { productId: product.id });
      } else {
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Could not save adjustment', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Stock Adjustment" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSectionCard>
          <SelectField
            label="Select Product"
            required
            value={productName}
            options={products.map(item => item.name)}
            onChange={setProductName}
          />

          <View style={styles.previewRow}>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Current Stock</Text>
              <Text style={styles.previewValue}>{product?.stock ?? 0}</Text>
            </View>
            <View style={styles.previewArrow}>
              <Icon name="arrow-right" size={24} color={colors.textSecondary} />
            </View>
            <View style={[styles.previewBox, styles.previewBoxAfter]}>
              <Text style={[styles.previewLabel, styles.previewLabelAfter]}>After Adjustment</Text>
              <Text style={[styles.previewValue, styles.previewValueAfter]}>{afterStock}</Text>
            </View>
          </View>

          <SelectField
            label="Adjustment Type"
            required
            value={adjustmentType}
            options={ADJUSTMENT_TYPES}
            onChange={setAdjustmentType}
          />

          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.quantityField, error && styles.quantityFieldError]}>
              <Icon name="package" size={16} color={colors.textSecondary} />
              <TextInput
                value={quantity}
                onChangeText={text => {
                  setQuantity(text.replace(/[^0-9]/g, ''));
                  if (error) setError(undefined);
                }}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                style={styles.quantityInput}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <SelectField label="Reason" required value={reason} options={STOCK_REASONS} onChange={setReason} />

          <Input
            label="Reference / Invoice No."
            value={reference}
            onChangeText={setReference}
            placeholder="e.g. INV-2026-0891"
          />

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional context" />
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Save Adjustment" onPress={handleSave} loading={saving} disabled={saving} />
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  previewBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  previewBoxAfter: {
    backgroundColor: colors.primarySurface,
  },
  previewArrow: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  previewLabelAfter: {
    color: colors.primary,
  },
  previewValue: {
    fontSize: 20,
    fontFamily: fontFamilies.extrabold,
    color: colors.textPrimary,
  },
  previewValueAfter: {
    color: colors.primary,
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
  quantityField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  quantityFieldError: {
    borderColor: colors.error,
  },
  quantityInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
