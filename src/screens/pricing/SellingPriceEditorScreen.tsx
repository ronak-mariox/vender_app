import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';
import { PriceInputField } from './PriceInputField';

type Props = NativeStackScreenProps<AuthStackParamList, 'SellingPriceEditor'>;

const PLATFORM_FEE_RATE = 0.08;

export function SellingPriceEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [spText, setSpText] = useState(String(product?.sellingPrice ?? ''));
  const [saving, setSaving] = useState(false);

  if (!product) return null;

  const sp = parseFloat(spText) || 0;
  const invalid = sp > product.mrp;
  const discountPct = product.mrp > 0 ? ((product.mrp - sp) / product.mrp) * 100 : 0;
  const platformFee = sp * PLATFORM_FEE_RATE;
  const payout = sp - platformFee;
  const healthy = discountPct <= 20;

  async function handleSave() {
    if (invalid || saving) return;
    setSaving(true);
    try {
      await updateProduct(productId, { sellingPrice: sp, updatedAt: Date.now() });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'Selling Price',
        message: `Selling price for ${product?.name} has been updated to ₹${sp}.`,
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
        <PriceInputField label="Selling Price" value={spText} onChangeText={setSpText} error={invalid} />

        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>Live Calculation</Text>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Discount from MRP</Text>
            <Text style={styles.calcValue}>{discountPct.toFixed(1)}%</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Platform commission (8%)</Text>
            <Text style={styles.calcValue}>₹{platformFee.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Estimated payout</Text>
            <Text style={styles.calcValue}>₹{payout.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.healthRow, !healthy && styles.healthRowWarning]}>
          <Icon
            name={healthy ? 'check-circle' : 'alert-triangle'}
            size={16}
            color={healthy ? colors.primary : colors.warningDark}
          />
          <Text style={[styles.healthText, !healthy && styles.healthTextWarning]}>
            {healthy
              ? `Margin is healthy at ${discountPct.toFixed(1)}%`
              : `Discount of ${discountPct.toFixed(1)}% is unusually high`}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} disabled={invalid || saving} loading={saving} />
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
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  healthRowWarning: {
    backgroundColor: colors.warningSurface,
  },
  healthText: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  healthTextWarning: {
    color: colors.warningDark,
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
