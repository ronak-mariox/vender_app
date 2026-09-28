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
import { NoVariantsState, VariantPicker, primaryVariantId, stockTypeForReason } from './VariantPicker';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StockAdjustment'>;

const ADJUSTMENT_TYPES = ['Add Stock (Incoming)', 'Remove Stock (Outgoing)', 'Set Exact Count'];

export function StockAdjustmentScreen({ navigation, route }: Props) {
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();

  const productOptions = useMemo(() => {
    const seen = new Map<string, number>();
    return products.map(item => {
      const base = item.sku ? `${item.name} · ${item.sku}` : item.name;
      const count = (seen.get(base) ?? 0) + 1;
      seen.set(base, count);
      return { id: item.id, label: count > 1 ? `${base} (${count})` : base };
    });
  }, [products]);

  const [productId, setProductId] = useState<string | undefined>(route.params?.productId);
  const product = useMemo(() => products.find(item => item.id === productId), [products, productId]);
  const [variantId, setVariantId] = useState<string | null>(primaryVariantId(product?.variants));
  const variant = product?.variants?.find(item => item.id === variantId);
  const [adjustmentType, setAdjustmentType] = useState(ADJUSTMENT_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(STOCK_REASONS[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const qtyNumber = parseInt(quantity, 10) || 0;
  const currentStock = variant?.stock ?? 0;

  const afterStock = useMemo(() => {
    if (adjustmentType === 'Add Stock (Incoming)') return currentStock + qtyNumber;
    if (adjustmentType === 'Remove Stock (Outgoing)') return Math.max(0, currentStock - qtyNumber);
    return qtyNumber;
  }, [currentStock, adjustmentType, qtyNumber]);

  function selectProduct(label: string) {
    const id = productOptions.find(option => option.label === label)?.id;
    const next = products.find(item => item.id === id);
    setProductId(id);
    setVariantId(primaryVariantId(next?.variants));
    setError(undefined);
  }

  async function handleSave() {
    if (!product) {
      setError('Select a product');
      return;
    }
    if (!variant) {
      setError('This product has no variant to adjust');
      return;
    }
    if (!quantity.trim() || (adjustmentType !== 'Set Exact Count' && qtyNumber <= 0)) {
      setError('Enter a valid quantity');
      return;
    }
    if (adjustmentType === 'Remove Stock (Outgoing)' && qtyNumber > currentStock) {
      setError(`Only ${currentStock} units in stock`);
      return;
    }
    if (afterStock === currentStock) {
      setError('This adjustment does not change the stock');
      return;
    }
    setError(undefined);
    if (saving) return;
    setSaving(true);
    try {
      const reasonText = notes.trim() ? `${reason} — ${notes.trim()}` : reason;
      const result = await recordStockChange({
        productId: product.id,
        variantId: variant.id,
        newStock: afterStock,
        reason: reasonText,
        type: stockTypeForReason(reason, afterStock - currentStock),
        reference: reference.trim() || undefined,
      });
      if (result.wentOutOfStock) {
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
            value={productOptions.find(option => option.id === productId)?.label ?? ''}
            options={productOptions.map(option => option.label)}
            onChange={selectProduct}
            placeholder={products.length === 0 ? 'No products yet' : 'Select a product'}
          />

          {product && !variant ? <NoVariantsState /> : null}
          {product ? (
            <VariantPicker variants={product.variants ?? []} selectedId={variantId} onSelect={setVariantId} />
          ) : null}

          <View style={styles.previewRow}>
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Current Stock</Text>
              <Text style={styles.previewValue}>{currentStock}</Text>
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
            placeholder="e.g. supplier invoice number"
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
