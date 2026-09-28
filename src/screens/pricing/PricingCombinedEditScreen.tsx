import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { NoVariantsState, VariantPicker } from '../inventory/VariantPicker';
import { PricingBackHeader } from './PricingBackHeader';
import { PriceInputField } from './PriceInputField';
import { usePricingVariant } from './usePricingVariant';

type Props = NativeStackScreenProps<AuthStackParamList, 'PricingCombinedEdit'>;

export function PricingCombinedEditScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const { variants, variant, variantId, setVariantId, saveVariantPrice } = usePricingVariant(product);

  const [mrpText, setMrpText] = useState(String(variant?.mrp ?? ''));
  const [spText, setSpText] = useState(String(variant?.sellingPrice ?? ''));
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="Edit Price" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const mrp = parseFloat(mrpText) || 0;
  const sp = parseFloat(spText) || 0;
  const error =
    mrp <= 0
      ? 'Enter a valid MRP'
      : sp <= 0
      ? 'Enter a valid selling price'
      : sp > mrp
      ? 'Selling price cannot exceed MRP'
      : undefined;
  const discountPct = mrp > 0 && !error ? ((mrp - sp) / mrp) * 100 : 0;
  const customerSaves = error ? 0 : mrp - sp;

  function selectVariant(id: string) {
    setVariantId(id);
    const next = variants.find(item => item.id === id);
    setMrpText(String(next?.mrp ?? ''));
    setSpText(String(next?.sellingPrice ?? ''));
  }

  async function handleSave() {
    if (error || saving || !variant) return;
    setSaving(true);
    try {
      await saveVariantPrice({ mrp, sellingPrice: sp });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'Price',
        message: `${product!.name}${variants.length > 1 ? ` (${variant.size})` : ''} is now ₹${sp} (MRP ₹${mrp}).`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Edit Price" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        {!variant ? <NoVariantsState /> : null}
        <VariantPicker variants={variants} selectedId={variantId} onSelect={selectVariant} />

        <PriceInputField label="MRP" value={mrpText} onChangeText={setMrpText} />
        <PriceInputField label="Selling Price" value={spText} onChangeText={setSpText} error={!!error} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Live Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Discount</Text>
            <Text style={styles.previewValue}>{discountPct.toFixed(1)}%</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Customer saves</Text>
            <Text style={styles.previewValueSemibold}>₹{customerSaves.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.bannerWrapper}>
          <InfoBanner
            variant="warning"
            message="Selling price must not exceed MRP. Ensure compliance before saving."
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save Changes" onPress={handleSave} disabled={!!error || saving || !variant} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  productName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  previewTitle: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewValue: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  previewValueSemibold: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  bannerWrapper: {
    paddingTop: spacing.xl,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
