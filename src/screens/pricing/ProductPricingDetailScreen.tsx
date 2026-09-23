import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductPricingDetail'>;

const PLATFORM_FEE_RATE = 0.08;

export function ProductPricingDetailScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  if (!product) return null;

  const discountPct = product.mrp > 0 ? ((product.mrp - product.sellingPrice) / product.mrp) * 100 : 0;
  const grossMargin = product.mrp - product.sellingPrice;
  const grossPct = product.mrp > 0 ? (grossMargin / product.mrp) * 100 : 0;
  const platformFee = product.sellingPrice * PLATFORM_FEE_RATE;
  const netMargin = grossMargin - platformFee;
  const netPct = product.mrp > 0 ? (netMargin / product.mrp) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Product Pricing" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.thumb}>
            <Icon name="package" size={22} color={colors.textTertiary} />
          </View>
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.summarySku}>SKU: {product.sku}</Text>
          </View>
          <View style={[styles.statusPill, product.status !== 'active' && styles.statusPillMuted]}>
            <Text style={[styles.statusPillText, product.status !== 'active' && styles.statusPillTextMuted]}>
              {product.status === 'active' ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Price Breakdown</Text>
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

        <View style={styles.marginCard}>
          <Text style={styles.marginTitle}>Margin Analysis</Text>
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>Gross Margin</Text>
            <Text style={styles.marginValue}>
              ₹{grossMargin.toFixed(2)} ({grossPct.toFixed(1)}%)
            </Text>
          </View>
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>Net Margin (after platform fee)</Text>
            <Text style={styles.marginValue}>
              ₹{netMargin.toFixed(2)} ({netPct.toFixed(1)}%)
            </Text>
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
