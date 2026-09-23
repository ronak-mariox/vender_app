import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DeleteProduct'>;

const DELETE_ITEMS = [
  'Product listing and all details',
  'All product images',
  'Price and discount settings',
  'Sales history and analytics',
  'Customer reviews (if any)',
];

export function DeleteProductScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, removeProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [deleting, setDeleting] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Delete Product" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  async function handleDelete() {
    if (deleting) return;
    const { name, sku } = product!;
    setDeleting(true);
    try {
      await removeProduct(productId);
      navigation.replace('DeleteConfirmation', { productName: name, sku });
    } catch (err) {
      Alert.alert('Could not delete product', getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Delete Product" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="trash" size={44} color={colors.error} />
          </View>
          <Text style={styles.heading}>Delete Product?</Text>
          <Text style={styles.subtitle}>
            This action is permanent and cannot be undone. All product data will be lost.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="package" size={20} color={colors.error} />
            </View>
            <View style={styles.summaryTextColumn}>
              <Text style={styles.summaryName}>{product.name}</Text>
              <Text style={styles.summaryMeta}>
                SKU: {product.sku} · {product.stock} units in stock
              </Text>
            </View>
          </View>

          <View style={styles.deleteCard}>
            <Text style={styles.deleteTitle}>Everything will be permanently deleted:</Text>
            {DELETE_ITEMS.map(item => (
              <View key={item} style={styles.deleteRow}>
                <Icon name="x" size={13} color={colors.error} />
                <Text style={styles.deleteItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Keep Product" variant="outline" onPress={() => navigation.goBack()} disabled={deleting} />
          <Button
            label="I understand, Delete Product"
            onPress={handleDelete}
            loading={deleting}
            disabled={deleting}
          />
        </View>
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
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: colors.errorSurface,
    borderWidth: 2,
    borderColor: colors.errorBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextColumn: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  summaryMeta: {
    ...typography.tiny,
    color: '#B91C1C',
  },
  deleteCard: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  deleteTitle: {
    ...typography.captionBold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  deleteItemText: {
    ...typography.caption,
    color: '#B91C1C',
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
