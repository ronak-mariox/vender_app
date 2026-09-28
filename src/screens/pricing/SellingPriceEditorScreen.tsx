import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import {
  GST_ON_FEE_PERCENT_LABEL,
  GST_ON_FEE_RATE,
  PLATFORM_FEE_PERCENT_LABEL,
  PLATFORM_FEE_RATE,
} from '../../constants/fees';
import { colors, radii, spacing, typography } from '../../theme';
import { NoVariantsState, VariantPicker } from '../inventory/VariantPicker';
import { PricingBackHeader } from './PricingBackHeader';
import { PriceInputField } from './PriceInputField';
import { usePricingVariant } from './usePricingVariant';

type Props = NativeStackScreenProps<AuthStackParamList, 'SellingPriceEditor'>;

export function SellingPriceEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const { variants, variant, variantId, setVariantId, saveVariantPrice } = usePricingVariant(product);
  const [spText, setSpText] = useState(String(variant?.sellingPrice ?? ''));
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="Selling Price" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const mrp = variant?.mrp ?? 0;
  const sp = parseFloat(spText) || 0;
  const error = !variant
    ? undefined
    : sp <= 0
    ? 'Enter a valid selling price'
    : sp > mrp
    ? `Selling price can't exceed the MRP (₹${mrp})`
    : undefined;
  const discountPct = mrp > 0 && sp <= mrp ? ((mrp - sp) / mrp) * 100 : 0;
  const platformFee = sp * PLATFORM_FEE_RATE;
  const gstOnFee = platformFee * GST_ON_FEE_RATE;
  const payout = sp - platformFee - gstOnFee;

  function selectVariant(id: string) {
    setVariantId(id);
    setSpText(String(variants.find(item => item.id === id)?.sellingPrice ?? ''));
  }

  async function handleSave() {
    if (error || saving || !variant) return;
    setSaving(true);
    try {
      await saveVariantPrice({ sellingPrice: sp });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'Selling Price',
        message: `Selling price for ${product!.name}${variants.length > 1 ? ` (${variant.size})` : ''} has been updated to ₹${sp}.`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Selling Price" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {!variant ? <NoVariantsState /> : null}
        <VariantPicker variants={variants} selectedId={variantId} onSelect={selectVariant} />

        <PriceInputField label="Selling Price" value={spText} onChangeText={setSpText} error={!!error && spText !== ''} />
        {error && spText !== '' ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>Live Calculation</Text>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>MRP</Text>
            <Text style={styles.calcValue}>₹{mrp}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Discount from MRP</Text>
            <Text style={styles.calcValue}>{discountPct.toFixed(1)}%</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Platform fee ({PLATFORM_FEE_PERCENT_LABEL})</Text>
            <Text style={styles.calcValue}>₹{platformFee.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>GST on fee ({GST_ON_FEE_PERCENT_LABEL})</Text>
            <Text style={styles.calcValue}>₹{gstOnFee.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Estimated payout per unit</Text>
            <Text style={styles.calcValue}>₹{payout.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} disabled={!!error || saving || !variant} loading={saving} />
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
  calcCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  calcTitle: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  calcLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calcValue: {
    ...typography.captionSemibold,
    color: colors.primary,
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
