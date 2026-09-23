import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';
import { PriceInputField } from './PriceInputField';

type Props = NativeStackScreenProps<AuthStackParamList, 'PricingCombinedEdit'>;

export function PricingCombinedEditScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const [mrpText, setMrpText] = useState(String(product?.mrp ?? ''));
  const [spText, setSpText] = useState(String(product?.sellingPrice ?? ''));

  if (!product) return null;

  const mrp = parseFloat(mrpText) || 0;
  const sp = parseFloat(spText) || 0;
  const invalid = sp > mrp;
  const discountPct = mrp > 0 ? ((mrp - sp) / mrp) * 100 : 0;
  const customerSaves = Math.max(0, mrp - sp);

  function handleSave() {
    if (invalid || !product) return;
    const changes = [
      { field: 'MRP', from: `₹${product.mrp}`, to: `₹${mrp}` },
      { field: 'Selling Price', from: `₹${product.sellingPrice}`, to: `₹${sp}` },
      {
        field: 'Discount',
        from: `${(product.mrp > 0 ? ((product.mrp - product.sellingPrice) / product.mrp) * 100 : 0).toFixed(1)}%`,
        to: `${discountPct.toFixed(1)}%`,
      },
    ];
    navigation.navigate('PriceReview', { productId, pendingMrp: mrp, pendingSellingPrice: sp, changes });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Edit Price" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>

        <PriceInputField label="MRP" value={mrpText} onChangeText={setMrpText} />
        <PriceInputField label="Selling Price" value={spText} onChangeText={setSpText} error={invalid} />

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Live Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Discount</Text>
            <Text style={styles.previewValue}>{discountPct.toFixed(1)}%</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Customer saves</Text>
            <Text style={styles.previewValueSemibold}>₹{customerSaves.toFixed(0)}</Text>
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
        <Button label="Save Changes" onPress={handleSave} disabled={invalid} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
