import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { NoVariantsState, VariantPicker } from '../inventory/VariantPicker';
import { PricingBackHeader } from './PricingBackHeader';
import { usePricingVariant } from './usePricingVariant';

type Props = NativeStackScreenProps<AuthStackParamList, 'DiscountEditor'>;

type Mode = 'percentage' | 'fixed';

const QUICK_PERCENTAGES = [5, 10, 15, 20];

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function currentDiscount(mrp: number, sp: number, mode: Mode) {
  if (mrp <= 0 || sp >= mrp) return '0';
  return String(round2(mode === 'percentage' ? ((mrp - sp) / mrp) * 100 : mrp - sp));
}

export function DiscountEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const { variants, variant, variantId, setVariantId, saveVariantPrice } = usePricingVariant(product);
  const [mode, setMode] = useState<Mode>('percentage');
  const [valueText, setValueText] = useState(currentDiscount(variant?.mrp ?? 0, variant?.sellingPrice ?? 0, 'percentage'));
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="Discount" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const mrp = variant?.mrp ?? 0;
  const value = parseFloat(valueText) || 0;
  const discountedPrice = round2(mode === 'percentage' ? mrp * (1 - value / 100) : mrp - value);
  const invalid = !variant || discountedPrice <= 0 || discountedPrice > mrp || value < 0;
  const customerSaves = round2(Math.max(0, mrp - discountedPrice));

  function selectVariant(id: string) {
    setVariantId(id);
    const next = variants.find(item => item.id === id);
    setValueText(currentDiscount(next?.mrp ?? 0, next?.sellingPrice ?? 0, mode));
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setValueText(currentDiscount(mrp, invalid ? variant?.sellingPrice ?? 0 : discountedPrice, next));
  }

  async function handleSave() {
    if (invalid || saving || !variant) return;
    setSaving(true);
    try {
      await saveVariantPrice({ sellingPrice: discountedPrice });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'Selling Price',
        message: `Selling price for ${product!.name}${variants.length > 1 ? ` (${variant.size})` : ''} is now ₹${discountedPrice} (₹${customerSaves} off MRP).`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Discount" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {!variant ? <NoVariantsState /> : null}
        <VariantPicker variants={variants} selectedId={variantId} onSelect={selectVariant} />

        <View style={styles.modeTabs}>
          <Pressable
            style={[styles.modeTab, mode === 'percentage' && styles.modeTabActive]}
            onPress={() => switchMode('percentage')}
          >
            <Text style={[styles.modeTabText, mode === 'percentage' && styles.modeTabTextActive]}>
              Percentage %
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === 'fixed' && styles.modeTabActive]}
            onPress={() => switchMode('fixed')}
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
            <Text style={styles.previewValue}>₹{mrp}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Discounted price</Text>
            <Text style={styles.previewValueBold}>{invalid ? '—' : `₹${discountedPrice}`}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Customer saves</Text>
            <Text style={styles.previewValueBold}>{invalid ? '—' : `₹${customerSaves}`}</Text>
          </View>
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
