import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import {
  GST_ON_FEE_PERCENT_LABEL,
  GST_ON_FEE_RATE,
  PLATFORM_FEE_PERCENT_LABEL,
  PLATFORM_FEE_RATE,
} from '../../constants/fees';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductPricingDetail'>;

export function ProductPricingDetailScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <PricingBackHeader title="Product Pricing" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const variants = product.variants ?? [];
  const multiVariant = variants.length > 1;
  const isLive = product.status === 'active' || product.status === 'low-stock' || product.status === 'out-of-stock';
  const discountPct = product.mrp > 0 ? ((product.mrp - product.sellingPrice) / product.mrp) * 100 : 0;
  const platformFee = product.sellingPrice * PLATFORM_FEE_RATE;
  const gstOnFee = platformFee * GST_ON_FEE_RATE;
  const payout = product.sellingPrice - platformFee - gstOnFee;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Product Pricing" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <ProductThumb
            imageUrl={product.images?.[0]}
            style={styles.thumb}
            iconSize={22}
            iconColor={colors.textTertiary}
          />
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.summarySku}>SKU: {product.sku || '—'}</Text>
          </View>
          <View style={[styles.statusPill, !isLive && styles.statusPillMuted]}>
            <Text style={[styles.statusPillText, !isLive && styles.statusPillTextMuted]}>
              {isLive ? 'Active' : product.status === 'pending' ? 'Pending' : product.status === 'rejected' ? 'Rejected' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{multiVariant ? 'Primary Variant Price' : 'Price Breakdown'}</Text>
          <Pressable onPress={() => navigation.navigate('PricingCombinedEdit', { productId })} hitSlop={8}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <FieldRow label="MRP" value={`₹${product.mrp}`} onPress={() => navigation.navigate('MRPEditor', { productId })} />
          <FieldRow
            label="Selling Price"
            value={`₹${product.sellingPrice}`}
            onPress={() => navigation.navigate('SellingPriceEditor', { productId })}
          />
          <FieldRow
            label="Discount"
            value={`${discountPct.toFixed(1)}%`}
            onPress={() => navigation.navigate('DiscountEditor', { productId })}
          />
          <FieldRow
            label="Tax"
            value={`${product.gstRate ?? '0'}% GST`}
            last
            onPress={() => navigation.navigate('TaxEditor', { productId })}
          />
        </View>

        {multiVariant ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>All Variants</Text>
              <Pressable onPress={() => navigation.navigate('EditPrice', { productId })} hitSlop={8}>
                <Text style={styles.editLink}>Edit all</Text>
              </Pressable>
            </View>
            <View style={styles.card}>
              {variants.map((variant, index) => (
                <FieldRow
                  key={variant.id}
                  label={`${variant.size}${variant.isPrimary ? ' (primary)' : ''}`}
                  value={`₹${variant.sellingPrice} · MRP ₹${variant.mrp}`}
                  last={index === variants.length - 1}
                  onPress={() => navigation.navigate('EditPrice', { productId })}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.marginCard}>
          <Text style={styles.marginTitle}>Your Payout Estimate{multiVariant ? ' (primary variant)' : ''}</Text>
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>Customer saves vs MRP</Text>
            <Text style={styles.marginValue}>₹{Math.max(0, product.mrp - product.sellingPrice).toFixed(2)}</Text>
          </View>
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>
              Platform fee ({PLATFORM_FEE_PERCENT_LABEL}) + GST ({GST_ON_FEE_PERCENT_LABEL})
            </Text>
            <Text style={styles.marginValue}>−₹{(platformFee + gstOnFee).toFixed(2)}</Text>
          </View>
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>Payout per unit</Text>
            <Text style={styles.marginValue}>₹{payout.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Update Price" onPress={() => navigation.navigate('PricingCombinedEdit', { productId })} />
      </View>
    </SafeAreaView>
  );
}

function FieldRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.fieldRow, !last && styles.fieldRowDivider]} onPress={onPress}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        <Icon name="chevron-right" size={15} color={colors.textTertiary} />
      </View>
    </Pressable>
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.border,
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
  summarySku: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusPill: {
    backgroundColor: colors.primarySurface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  statusPillMuted: {
    backgroundColor: colors.surfaceAlt,
  },
  statusPillText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  statusPillTextMuted: {
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  editLink: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  fieldRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldValue: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  marginCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  marginTitle: {
    ...typography.labelSemibold,
    color: colors.primary,
    paddingBottom: spacing.sm,
  },
  marginRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  marginLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  marginValue: {
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
