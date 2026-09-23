import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, BadgeTone } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useProductCatalog, ProductStatus } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditProduct'>;

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

export function EditProductScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.missingState}>
          <Icon name="package" size={32} color={colors.textTertiary} />
          <Text style={styles.missingText}>This product is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = product.status === 'active' || product.status === 'low-stock';
  const statusMeta = STATUS_META[product.status];

  const sections: {
    key: string;
    icon: IconName;
    iconBackground: string;
    iconColor: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }[] = [
    {
      key: 'basic',
      icon: 'edit',
      iconBackground: colors.primarySurface,
      iconColor: colors.primary,
      title: 'Basic Information',
      subtitle: 'Name, brand, description',
      onPress: () => navigation.navigate('EditInformation', { productId }),
    },
    {
      key: 'images',
      icon: 'image',
      iconBackground: '#F5F3FF',
      iconColor: '#7C3AED',
      title: 'Product Images',
      subtitle: `${product.galleryCount ?? 0} images uploaded`,
      onPress: () => navigation.navigate('EditImages', { productId }),
    },
    {
      key: 'category',
      icon: 'tag',
      iconBackground: '#EFF8FF',
      iconColor: '#1570EF',
      title: 'Category & Brand',
      subtitle: `${product.categoryName} · ${product.subcategoryName}`,
      onPress: () => navigation.navigate('EditInformation', { productId }),
    },
    {
      key: 'price',
      icon: 'percent',
      iconBackground: '#FFF7ED',
      iconColor: '#EA580C',
      title: 'Price & Discount',
      subtitle: `MRP ₹${product.mrp} · Selling ₹${product.sellingPrice} · ${
        product.mrp > 0 ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
      }% off`,
      onPress: () => navigation.navigate('EditPrice', { productId }),
    },
    {
      key: 'tax',
      icon: 'hash',
      iconBackground: '#ECFEFF',
      iconColor: '#0891B2',
      title: 'Tax Information',
      subtitle: `GST ${product.gstRate ?? '0'}% · HSN ${product.hsnCode ?? '—'}`,
      onPress: () => navigation.navigate('EditInformation', { productId }),
    },
    {
      key: 'sku',
      icon: 'barcode',
      iconBackground: '#F5F3FF',
      iconColor: '#7C3AED',
      title: 'SKU & Barcode',
      subtitle: product.sku,
      onPress: () =>
        Alert.alert('SKU & Barcode', 'SKU and barcode cannot be changed after the product is published.'),
    },
    {
      key: 'stock',
      icon: 'package',
      iconBackground: colors.primarySurface,
      iconColor: colors.primary,
      title: 'Stock & Inventory',
      subtitle: `${product.stock} units · Reorder at ${product.reorderLevel}`,
      onPress: () => navigation.navigate('EditStock', { productId }),
    },
    {
      key: 'variants',
      icon: 'tag',
      iconBackground: '#FFF7ED',
      iconColor: '#EA580C',
      title: 'Pack Size & Variants',
      subtitle: `${product.packSize ?? '—'} · ${product.variants?.length ?? 0} variants`,
      onPress: () => navigation.navigate('EditInformation', { productId }),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTextColumn}>
            <Text style={styles.headerTitle}>Edit Product</Text>
            <Text style={styles.headerSubtitle}>Last updated: 2 hours ago</Text>
          </View>
          <Badge label={statusMeta.label} tone={statusMeta.tone} />
        </View>
        <View style={styles.productRow}>
          <View style={styles.productIcon}>
            <Icon name="package" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.productTextColumn}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.productMeta}>
              SKU: {product.sku} · {product.stock} in stock
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map(section => (
          <Pressable key={section.key} style={styles.sectionCard} onPress={section.onPress}>
            <View style={[styles.sectionIcon, { backgroundColor: section.iconBackground }]}>
              <Icon name={section.icon} size={18} color={section.iconColor} />
            </View>
            <View style={styles.sectionTextColumn}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSubtitle} numberOfLines={1}>
                {section.subtitle}
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        ))}

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Product Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.deactivateButton}
              onPress={() =>
                navigation.navigate(isActive ? 'DeactivateProduct' : 'ActivateProduct', { productId })
              }
            >
              <Icon name="pause-circle" size={14} color={colors.textPrimary} />
              <Text style={styles.deactivateText}>{isActive ? 'Deactivate' : 'Activate'}</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => navigation.navigate('DeleteProduct', { productId })}
            >
              <Icon name="trash" size={14} color={colors.white} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
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
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextColumn: {
    flex: 1,
    gap: 2,
  },
  productName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  productMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTextColumn: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  actionsCard: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  actionsTitle: {
    ...typography.captionBold,
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  deactivateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  deactivateText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
  },
  deleteText: {
    ...typography.captionSemibold,
    color: colors.white,
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
