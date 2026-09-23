import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, NavHeader, ReviewSectionCard } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReviewProduct'>;

export function ReviewProductScreen({ navigation }: Props) {
  const { draft, effectivePricing } = useProductDraft();
  const basicInfo = draft.basicInfo;
  // Falls back to the primary variant's price when this is an attribute-kind product
  // (e.g. Fashion sizes), where pricing is set per-variant and draft.pricing stays empty.
  const pricing = effectivePricing;
  const identifiers = draft.identifiers;
  const stock = draft.stock;
  const category = draft.category;
  const variantCount = draft.packSize?.variants?.length ?? 0;
  const gstLabel = draft.tax?.gstRate === '0' ? '0% (Exempt)' : draft.tax?.gstRate ? `${draft.tax.gstRate}%` : '—';
  const discountPercent =
    pricing && parseFloat(pricing.mrp) > parseFloat(pricing.sellingPrice || '0') && parseFloat(pricing.mrp) > 0
      ? (
          ((parseFloat(pricing.mrp) - parseFloat(pricing.sellingPrice || '0')) / parseFloat(pricing.mrp)) *
          100
        ).toFixed(1)
      : '0';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Review Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Icon name="package" size={28} color={colors.textTertiary} />
          </View>
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryName}>{basicInfo?.name || 'Untitled Product'}</Text>
            <Text style={styles.summaryMeta}>
              {basicInfo?.brand || '—'} · {draft.packSize ? `${draft.packSize.netWeight}${draft.packSize.unit.split(' ')[0]}` : '—'} ·{' '}
              {category?.subcategoryName || category?.categoryName || '—'}
            </Text>
            <View style={styles.summaryPriceRow}>
              <Text style={styles.summaryPrice}>₹{pricing?.sellingPrice || 0}</Text>
              {pricing?.mrp && pricing.mrp !== pricing.sellingPrice ? (
                <Text style={styles.summaryMrp}>₹{pricing.mrp}</Text>
              ) : null}
              <Badge label="Draft" tone="info" />
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
          icon="percent"
          title="Pricing"
          onEdit={() => navigation.navigate('ProductMRP')}
          rows={[
            { label: 'MRP', value: pricing?.mrp ? `₹${parseFloat(pricing.mrp).toFixed(2)}` : '—' },
            { label: 'Selling Price', value: pricing?.sellingPrice ? `₹${parseFloat(pricing.sellingPrice).toFixed(2)}` : '—' },
            { label: 'Discount', value: `${discountPercent}%` },
            { label: 'GST', value: gstLabel },
            ...(variantCount > 1 ? [{ label: 'Note', value: `Primary of ${variantCount} variants shown` }] : []),
          ]}
        />

        <ReviewSectionCard
          icon="hash"
          title="Identifiers"
          onEdit={() => navigation.navigate('ProductSKU')}
          rows={[
            { label: 'SKU', value: identifiers?.sku || '—' },
            { label: 'Barcode', value: identifiers?.barcode || 'Not added' },
          ]}
        />

        <ReviewSectionCard
          icon="package"
          title="Stock"
          onEdit={() => navigation.navigate('ProductStockQuantity')}
          rows={[
            { label: 'Opening Stock', value: `${stock?.opening ?? 0} units` },
            { label: 'Reorder Level', value: `${stock?.reorderLevel ?? 0} units` },
          ]}
        />

        <View style={styles.footer}>
          <Button label="Publish Product" onPress={() => navigation.navigate('PublishProduct')} />
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
