import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'DiscountEditor'>;

type Mode = 'percentage' | 'fixed';

const QUICK_PERCENTAGES = [5, 10, 15, 20];

export function DiscountEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  const initialPct =
    product && product.mrp > 0 ? (((product.mrp - product.sellingPrice) / product.mrp) * 100).toFixed(1) : '0';
  const [mode, setMode] = useState<Mode>('percentage');
  const [valueText, setValueText] = useState(initialPct);

  if (!product) return null;

  const value = parseFloat(valueText) || 0;
  const discountedPrice =
    mode === 'percentage' ? Math.round(product.mrp * (1 - value / 100)) : Math.round(product.mrp - value);
  const clampedPrice = Math.max(0, Math.min(product.mrp, discountedPrice));
  const customerSaves = product.mrp - clampedPrice;
  const discountPct = product.mrp > 0 ? (customerSaves / product.mrp) * 100 : 0;

  function handleSave() {
    if (!product) return;
    const previousPct = product.mrp > 0 ? ((product.mrp - product.sellingPrice) / product.mrp) * 100 : 0;
    navigation.navigate('PriceReview', {
      productId,
      pendingSellingPrice: clampedPrice,
      changes: [
        { field: 'Selling Price', from: `₹${product.sellingPrice}`, to: `₹${clampedPrice}` },
        { field: 'Discount', from: `${previousPct.toFixed(1)}%`, to: `${discountPct.toFixed(1)}%` },
      ],
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Discount" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeTabs}>
          <Pressable
            style={[styles.modeTab, mode === 'percentage' && styles.modeTabActive]}
            onPress={() => setMode('percentage')}
          >
            <Text style={[styles.modeTabText, mode === 'percentage' && styles.modeTabTextActive]}>
              Percentage %
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === 'fixed' && styles.modeTabActive]}
            onPress={() => setMode('fixed')}
          >
            <Text style={[styles.modeTabText, mode === 'fixed' && styles.modeTabTextActive]}>Fixed Amount ₹</Text>
          </Pressable>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Discount Value</Text>
          <View style={styles.field}>
            <TextInput
              value={valueText}
              onChangeText={text => setValueText(text.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <View style={styles.affix}>
              <Text style={styles.affixText}>{mode === 'percentage' ? '%' : '₹'}</Text>
            </View>
          </View>
        </View>

        {mode === 'percentage' ? (
          <View style={styles.chipsRow}>
            {QUICK_PERCENTAGES.map(pct => {
              const active = valueText === String(pct);
              return (
                <Pressable
                  key={pct}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setValueText(String(pct))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{pct}%</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Original (MRP)</Text>
            <Text style={styles.previewValue}>₹{product.mrp}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Discounted price</Text>
            <Text style={styles.previewValueBold}>₹{clampedPrice}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Customer saves</Text>
            <Text style={styles.previewValueBold}>₹{customerSaves}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} />
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: colors.white,
  },
  fieldBlock: {
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 51,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.lg,
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  affix: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  affixText: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  previewCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  previewTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
  },
  previewValueBold: {
    ...typography.bodySemibold,
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
