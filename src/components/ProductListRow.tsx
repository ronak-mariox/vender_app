import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { Badge, BadgeTone } from './Badge';
import { Product, ProductStatus } from '../context/ProductCatalogContext';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

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

type Props = {
  product: Product;
  onPress: () => void;
  onMorePress?: () => void;
};

export function ProductListRow({ product, onPress, onMorePress }: Props) {
  const statusMeta = STATUS_META[product.status];
  const isOutOfStock = product.stock === 0 && product.status !== 'uploading';
  const showDiscount = product.mrp > product.sellingPrice;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.thumb}>
        {product.images?.[0] ? (
          <Image source={{ uri: resolveAssetUrl(product.images[0]) }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <Icon name="package" size={22} color={colors.textTertiary} />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Pressable onPress={onMorePress} hitSlop={8}>
            <Icon name="more-vertical" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {product.brand} · {product.subcategoryName || product.categoryName}
        </Text>

        {product.status === 'uploading' ? (
          <View style={styles.uploadRow}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Badge label="Uploading" tone="info" />
          </View>
        ) : (
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>₹{product.sellingPrice}</Text>
              {showDiscount ? <Text style={styles.mrp}>₹{product.mrp}</Text> : null}
            </View>
            <View style={styles.rightGroup}>
              <Text style={[styles.stockText, isOutOfStock && styles.stockTextError]}>
                {isOutOfStock ? 'Out of stock' : `${product.stock} units`}
              </Text>
              <Badge label={statusMeta.label} tone={statusMeta.tone} />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    flex: 1,
  },
  meta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  mrp: {
    ...typography.tiny,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stockText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  stockTextError: {
    color: colors.error,
    fontFamily: fontFamilies.semibold,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    width: '65%',
    height: 3,
    borderRadius: radii.full,
    backgroundColor: '#1570EF',
  },
});
