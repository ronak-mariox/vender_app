import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, BadgeTone, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog, ProductStatus } from '../../context/ProductCatalogContext';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { formatEventTimestamp } from '../../utils/time';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductDetails'>;

const STATUS_META: Record<ProductStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  'low-stock': { label: 'Low Stock', tone: 'warning' },
  'out-of-stock': { label: 'Out of Stock', tone: 'error' },
  draft: { label: 'Draft', tone: 'info' },
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  uploading: { label: 'Uploading', tone: 'info' },
  error: { label: 'Error', tone: 'error' },
};

export function ProductDetailsScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Product" onBack={() => navigation.goBack()} />
        <View style={styles.missingState}>
          <Icon name="package" size={32} color={colors.textTertiary} />
          <Text style={styles.missingText}>This product is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isActive =
    product.status === 'active' || product.status === 'low-stock' || product.status === 'out-of-stock';
  const variants = product.variants ?? [];
  const statusMeta = STATUS_META[product.status];
  const discountPercent =
    product.mrp > 0 && product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView bounces={false}>
        <View style={styles.hero}>
          {product.images?.[0] ? (
            <Image source={{ uri: resolveAssetUrl(product.images[0]) }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <Icon name="package" size={72} color={colors.textTertiary} />
          )}
          <Pressable style={[styles.heroButton, styles.heroButtonLeft]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            style={[styles.heroButton, styles.heroButtonRight]}
            onPress={() => Alert.alert('Share Product', 'Coming soon.')}
          >
            <Icon name="share" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.meta}>
                {[product.brand, product.categoryName, product.subcategoryName].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Badge label={statusMeta.label} tone={statusMeta.tone} />
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditProduct', { productId })}
            >
              <Icon name="edit" size={14} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deactivateButton]}
              onPress={() =>
                navigation.navigate(isActive ? 'DeactivateProduct' : 'ActivateProduct', { productId })
              }
            >
              <Icon name="pause-circle" size={14} color={colors.textPrimary} />
              <Text style={styles.deactivateButtonText}>{isActive ? 'Deactivate' : 'Activate'}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => navigation.navigate('DeleteProduct', { productId })}
            >
              <Icon name="trash" size={14} color={colors.error} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>

        {product.status === 'rejected' && product.rejectionReason ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejection Reason</Text>
            <Text style={styles.meta}>{product.rejectionReason}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing{variants.length > 1 ? ' (primary variant)' : ''}</Text>
          <View style={styles.pricingRow}>
            <View style={styles.pricingBox}>
              <Text style={styles.pricingLabel}>MRP</Text>
              <Text style={styles.pricingValue}>₹{product.mrp}</Text>
            </View>
            <View style={[styles.pricingBox, styles.pricingBoxSelling]}>
              <Text style={[styles.pricingLabel, styles.pricingLabelSelling]}>Selling Price</Text>
              <Text style={[styles.pricingValue, styles.pricingValueSelling]}>₹{product.sellingPrice}</Text>
            </View>
            <View style={[styles.pricingBox, styles.pricingBoxDiscount]}>
              <Text style={[styles.pricingLabel, styles.pricingLabelDiscount]}>Discount</Text>
              <Text style={[styles.pricingValue, styles.pricingValueDiscount]}>{discountPercent}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Stock</Text>
            <Pressable onPress={() => navigation.navigate('EditStock', { productId })}>
              <Text style={styles.updateLink}>Update</Text>
            </Pressable>
          </View>
          <View style={styles.stockRow}>
            <View style={styles.stockBox}>
              <Text style={styles.stockValue}>{product.stock}</Text>
              <Text style={styles.stockLabel}>
                {product.stock > 0 ? (variants.length > 1 ? 'Total in stock' : 'In Stock') : 'Out of Stock'}
              </Text>
            </View>
            <View style={styles.stockMetaColumn}>
              <Text style={styles.stockMetaLabel}>Reorder Level</Text>
              <Text style={styles.stockMetaValue}>{product.reorderLevel ? `${product.reorderLevel} units` : 'Not set'}</Text>
              <Text style={[styles.stockMetaLabel, styles.stockMetaLabelSpaced]}>Max Stock</Text>
              <Text style={styles.stockMetaValue}>{product.maxStock ? `${product.maxStock} units` : 'Not set'}</Text>
            </View>
          </View>
        </View>

        {variants.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variants</Text>
            {variants.map((variant, index) => (
              <DetailRow
                key={variant.id}
                icon="layers"
                label={`${variant.size}${variant.isPrimary ? ' (primary)' : ''}`}
                value={`₹${variant.sellingPrice} · MRP ₹${variant.mrp} · ${variant.stock} units`}
                last={index === variants.length - 1}
              />
            ))}
          </View>
        ) : null}

        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.meta}>{product.description}</Text>
          </View>
        ) : null}

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <DetailRow icon="hash" label="SKU" value={product.sku || 'Not set'} mono />
          {product.barcode ? <DetailRow icon="barcode" label="Barcode" value={product.barcode} mono /> : null}
          {product.packSize ? <DetailRow icon="tag" label="Pack Size" value={product.packSize} /> : null}
          {product.gstRate ? (
            <DetailRow icon="percent" label="GST Rate" value={`${product.gstRate}%${product.gstRate === '0' ? ' (Exempt)' : ''}`} />
          ) : null}
          {product.hsnCode ? <DetailRow icon="hash" label="HSN Code" value={product.hsnCode} mono /> : null}
          {product.countryOfOrigin ? <DetailRow icon="globe" label="Country of Origin" value={product.countryOfOrigin} /> : null}
          <DetailRow
            icon="clock"
            label="Last Updated"
            value={product.updatedAt ? formatEventTimestamp(product.updatedAt) : '—'}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
  last,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Icon name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailValueMono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    height: 200,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroButton: {
    position: 'absolute',
    top: spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.overlayLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonLeft: {
    left: spacing.xl,
  },
  heroButtonRight: {
    right: spacing.xl,
  },
  titleSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.h3,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  editButton: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryBorder,
  },
  editButtonText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  deactivateButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  deactivateButtonText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  deleteButton: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.errorBorder,
  },
  deleteButtonText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.error,
  },
  section: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateLink: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  pricingBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  pricingBoxSelling: {
    backgroundColor: colors.primarySurface,
  },
  pricingBoxDiscount: {
    backgroundColor: '#FFF7ED',
  },
  pricingLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  pricingLabelSelling: {
    color: colors.primary,
  },
  pricingLabelDiscount: {
    color: '#EA580C',
  },
  pricingValue: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  pricingValueSelling: {
    color: colors.primary,
  },
  pricingValueDiscount: {
    color: '#EA580C',
  },
  stockRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stockBox: {
    flex: 1,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  stockValue: {
    ...typography.h2,
    fontSize: 22,
    color: colors.primary,
  },
  stockLabel: {
    ...typography.tiny,
    color: colors.primary,
  },
  stockMetaColumn: {
    width: 110,
    gap: 2,
  },
  stockMetaLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  stockMetaLabelSpaced: {
    paddingTop: spacing.sm,
  },
  stockMetaValue: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 80,
  },
  detailValue: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  detailValueMono: {
    fontFamily: 'Courier',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  missingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
