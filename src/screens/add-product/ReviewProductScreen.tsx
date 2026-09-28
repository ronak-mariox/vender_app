import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, NavHeader, ReviewSectionCard } from '../../components';
import { packSizeLabel, useProductDraft, usesVariantPricing } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReviewProduct'>;

function money(value?: string) {
  const numeric = parseFloat(value ?? '');
  return Number.isNaN(numeric) ? '—' : `₹${numeric.toFixed(2)}`;
}

export function ReviewProductScreen({ navigation }: Props) {
  const { draft, effectivePricing: pricing } = useProductDraft();
  const basicInfo = draft.basicInfo;
  const identifiers = draft.identifiers;
  const stock = draft.stock;
  const category = draft.category;
  const perVariant = usesVariantPricing(draft.packSize);
  const variants = perVariant ? draft.packSize?.variants ?? [] : [];
  const sizeLabel = perVariant ? `${variants.length} variants` : packSizeLabel(draft.packSize) || '—';
  const gstLabel = draft.tax?.gstRate === '0' ? '0% (Exempt)' : draft.tax?.gstRate ? `${draft.tax.gstRate}%` : '—';
  const mrp = parseFloat(pricing?.mrp ?? '');
  const sp = parseFloat(pricing?.sellingPrice ?? '');
  const discountPercent = mrp > 0 && sp < mrp ? (((mrp - sp) / mrp) * 100).toFixed(1) : '0';
  const openingStock = perVariant
    ? variants.reduce((sum, variant) => sum + (parseInt(variant.stock, 10) || 0), 0)
    : parseInt(stock?.opening ?? '', 10) || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Review Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <ProductThumb
            imageUrl={draft.images.images[0]}
            style={styles.summaryIcon}
            iconSize={28}
            iconColor={colors.textTertiary}
          />
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryName}>{basicInfo?.name || '—'}</Text>
            <Text style={styles.summaryMeta}>
              {basicInfo?.brand || 'No brand'} · {sizeLabel} · {category?.subcategoryName || category?.categoryName || '—'}
            </Text>
            <View style={styles.summaryPriceRow}>
              <Text style={styles.summaryPrice}>{money(pricing?.sellingPrice)}</Text>
              {pricing?.mrp && pricing.mrp !== pricing.sellingPrice ? (
                <Text style={styles.summaryMrp}>{money(pricing.mrp)}</Text>
              ) : null}
              <Badge label="Not submitted" tone="info" />
            </View>
          </View>
        </View>

        <ReviewSectionCard
          icon="edit"
          title="Basic Information"
          onEdit={() => navigation.navigate('ProductBasicInfo')}
          rows={[
            { label: 'Product Name', value: basicInfo?.name || '—' },
            { label: 'Brand', value: basicInfo?.brand || '—' },
            { label: 'Country of Origin', value: basicInfo?.countryOfOrigin || '—' },
          ]}
        />

        <ReviewSectionCard
          icon="image"
          title="Images"
          onEdit={() => navigation.navigate('ProductImages')}
          rows={[
            { label: 'Main Image', value: draft.images.images[0] ? 'Added' : 'Not added' },
            { label: 'Additional', value: `${Math.max(0, draft.images.images.length - 1)} images added` },
          ]}
        />

        <ReviewSectionCard
          icon="grid"
          title="Category"
          onEdit={() => navigation.navigate('ProductCategoryStep')}
          rows={[
            { label: 'Category', value: category?.categoryName || '—' },
            { label: 'Sub-category', value: category?.subcategoryName || '—' },
          ]}
        />

        <ReviewSectionCard
          icon="file-text"
          title="Description"
          onEdit={() => navigation.navigate('ProductDescriptionStep')}
          rows={[{ label: 'Description', value: draft.description?.description || '—' }]}
        />

        {perVariant ? (
          <ReviewSectionCard
            icon="layers"
            title="Variants"
            onEdit={() => navigation.navigate('PackSizeVariant')}
            rows={variants.map(variant => ({
              label: `${variant.size}${variant.isPrimary ? ' (primary)' : ''}`,
              value: `${money(variant.mrp)} → ${money(variant.sellingPrice)} · ${parseInt(variant.stock, 10) || 0} units`,
            }))}
          />
        ) : (
          <ReviewSectionCard
            icon="percent"
            title="Pack Size & Pricing"
            onEdit={() => navigation.navigate('PackSizeVariant')}
            rows={[
              { label: 'Pack Size', value: sizeLabel },
              { label: 'MRP', value: money(pricing?.mrp) },
              { label: 'Selling Price', value: money(pricing?.sellingPrice) },
              { label: 'Discount', value: `${discountPercent}%` },
            ]}
          />
        )}

        <ReviewSectionCard
          icon="file-text"
          title="Tax"
          onEdit={() => navigation.navigate('ProductTaxInfo')}
          rows={[
            { label: 'GST', value: gstLabel },
            { label: 'HSN Code', value: draft.tax?.hsnCode || 'Not added' },
          ]}
        />

        <ReviewSectionCard
          icon="hash"
          title="Identifiers"
          onEdit={() => navigation.navigate('ProductSKU')}
          rows={[
            { label: 'SKU', value: identifiers?.sku || 'Not added' },
            { label: 'Barcode', value: identifiers?.barcode || 'Not added' },
          ]}
        />

        <ReviewSectionCard
          icon="package"
          title="Stock"
          onEdit={() => navigation.navigate('ProductStockQuantity')}
          rows={[
            { label: 'Opening Stock', value: `${openingStock} units` },
            { label: 'Reorder Level', value: stock?.reorderLevel ? `${stock.reorderLevel} units` : 'Not set' },
            { label: 'Max Stock', value: stock?.maxStock ? `${stock.maxStock} units` : 'Not set' },
          ]}
        />

        <View style={styles.footer}>
          <Button label="Continue to Publish" onPress={() => navigation.navigate('PublishProduct')} />
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
    gap: spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xs,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextColumn: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  summaryMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  summaryPrice: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    color: colors.primary,
  },
  summaryMrp: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  footer: {
    paddingTop: spacing.md,
  },
});
