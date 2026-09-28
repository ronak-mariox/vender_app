import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'OOSConfirmation'>;

export function OOSConfirmationScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Out of Stock Alert" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const variants = product.variants ?? [];
  const emptyVariants = variants.filter(variant => variant.stock === 0);
  const partlyOut = product.stock > 0;

  const impactItems = partlyOut
    ? [
        `${emptyVariants.map(variant => variant.size).join(', ')} can't be ordered until restocked`,
        `${product.stock} units remain across other variants`,
      ]
    : ["Customers can't order this product until you add stock", 'It stays in your catalog with its details and prices'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Out of Stock Alert" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="package" size={44} color={colors.error} />
          </View>
          <Text style={styles.heading}>{partlyOut ? 'Variant Out of Stock' : 'Product is Out of Stock'}</Text>
          <Text style={styles.subtitle}>
            {partlyOut
              ? `A variant of ${product.name} has reached 0 units.`
              : `${product.name} has reached 0 units.`}
          </Text>

          <View style={styles.summaryCard}>
            <ProductThumb
              imageUrl={product.images?.[0]}
              style={styles.summaryIcon}
              iconSize={20}
              iconColor={colors.error}
            />
            <View style={styles.summaryTextColumn}>
              <Text style={styles.summaryName}>{product.name}</Text>
              <Text style={styles.summaryMeta}>
                SKU: {product.sku || '—'} · {product.categoryName || '—'}
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {partlyOut ? `${product.stock} units left in total` : "0 units · Can't be ordered"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.impactCard}>
            <Text style={styles.impactTitle}>Impact</Text>
            {impactItems.map(item => (
              <View key={item} style={styles.impactRow}>
                <Icon name="alert-circle" size={13} color={colors.error} />
                <Text style={styles.impactText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Add Stock Now"
            onPress={() => navigation.replace('UpdateQuantity', { productId })}
          />
          <Button label="Not now" variant="outline" onPress={() => navigation.goBack()} />
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
    paddingTop: spacing.xxl,
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
    alignItems: 'flex-start',
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.error,
  },
  statusText: {
    ...typography.tinyBold,
    color: colors.error,
  },
  impactCard: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  impactTitle: {
    ...typography.captionBold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  impactText: {
    ...typography.caption,
    color: '#B91C1C',
    flex: 1,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
