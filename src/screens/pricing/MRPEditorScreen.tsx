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

type Props = NativeStackScreenProps<AuthStackParamList, 'MRPEditor'>;

export function MRPEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const { variants, variant, variantId, setVariantId, saveVariantPrice } = usePricingVariant(product);
  const [mrpText, setMrpText] = useState(String(variant?.mrp ?? ''));
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="MRP" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const mrp = parseFloat(mrpText) || 0;
  const sellingPrice = variant?.sellingPrice ?? 0;
  const error = !variant
    ? undefined
    : mrp <= 0
    ? 'Enter a valid MRP'
    : mrp < sellingPrice
    ? `MRP can't be below the current selling price (₹${sellingPrice}). Lower the selling price first.`
    : undefined;

  function selectVariant(id: string) {
    setVariantId(id);
    setMrpText(String(variants.find(item => item.id === id)?.mrp ?? ''));
  }

  async function handleSave() {
    if (saving || error || !variant) return;
    setSaving(true);
    try {
      await saveVariantPrice({ mrp });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'MRP',
        message: `MRP for ${product!.name}${variants.length > 1 ? ` (${variant.size})` : ''} has been updated to ₹${mrp}.`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="MRP" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What is MRP?</Text>
          <Text style={styles.infoBody}>
            Maximum Retail Price is the manufacturer-set price. You cannot sell above MRP.
          </Text>
        </View>

        {!variant ? <NoVariantsState /> : null}
        <VariantPicker variants={variants} selectedId={variantId} onSelect={selectVariant} />

        <PriceInputField label="MRP" value={mrpText} onChangeText={setMrpText} error={!!error && mrpText !== ''} />
        {error && mrpText !== '' ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.bannerWrapper}>
          <InfoBanner variant="info" message="Setting selling price above MRP is prohibited by law." />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} loading={saving} disabled={saving || !!error || !variant} />
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
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  infoBody: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  bannerWrapper: {
    paddingTop: spacing.lg,
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
