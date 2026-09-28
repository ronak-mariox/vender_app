import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'TaxEditor'>;

const TAX_SLABS = [
  { rate: '0', label: '0%', hint: 'Unprocessed food' },
  { rate: '5', label: '5%', hint: 'Food items, packaged staples' },
  { rate: '12', label: '12%', hint: 'Processed food, beverages' },
  { rate: '18', label: '18%', hint: 'General goods' },
  { rate: '28', label: '28%', hint: 'Luxury items' },
];

export function TaxEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [gstRate, setGstRate] = useState(String(Number(product?.gstRate ?? '0')));
  const [hsnCode, setHsnCode] = useState(product?.hsnCode ?? '');
  const [saving, setSaving] = useState(false);

  const [hsnError, setHsnError] = useState<string | undefined>();

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="Tax / GST" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    if (saving) return;
    if (hsnCode.trim() && !/^\d{4,8}$/.test(hsnCode.trim())) {
      setHsnError('HSN codes are 4 to 8 digits');
      return;
    }
    setSaving(true);
    try {
      await updateProduct(productId, { gstRate, hsnCode: hsnCode.trim() });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'Tax',
        message: `Tax slab for ${product?.name} has been updated to ${gstRate}% GST.`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Tax / GST" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            GST is calculated on the selling price and collected from customers. Select the applicable slab
            for this product.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Tax Slab</Text>
        <View style={styles.card}>
          {TAX_SLABS.map((slab, index) => {
            const active = slab.rate === gstRate;
            return (
              <Pressable
                key={slab.rate}
                style={[
                  styles.slabRow,
                  index < TAX_SLABS.length - 1 && styles.rowDivider,
                  active && styles.slabRowActive,
                ]}
                onPress={() => setGstRate(slab.rate)}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.slabTextColumn}>
                  <Text style={[styles.slabLabel, active && styles.slabLabelActive]}>{slab.label}</Text>
                  <Text style={styles.slabHint}>{slab.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>HSN Code</Text>
          <TextInput
            value={hsnCode}
            onChangeText={text => {
              setHsnCode(text.replace(/[^0-9]/g, ''));
              setHsnError(undefined);
            }}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={8}
          />
          {hsnError ? <Text style={styles.errorText}>{hsnError}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} loading={saving} disabled={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
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
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  slabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  slabRowActive: {
    backgroundColor: colors.primarySurface,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  slabTextColumn: {
    gap: 1,
  },
  slabLabel: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  slabLabelActive: {
    fontFamily: fontFamilies.bold,
    color: colors.primary,
  },
  slabHint: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  fieldBlock: {
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  input: {
    height: 51,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
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
