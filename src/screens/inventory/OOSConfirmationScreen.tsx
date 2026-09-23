import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OOSConfirmation'>;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function OOSConfirmationScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const { eventsForProduct } = useInventory();
  const product = products.find(item => item.id === productId);
  const events = useMemo(() => eventsForProduct(productId), [eventsForProduct, productId]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Out of Stock Alert" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const sold7d = events
    .filter(event => event.delta < 0 && event.timestamp >= cutoff)
    .reduce((sum, event) => sum + Math.abs(event.delta), 0);
  const revenue7d = sold7d * product.sellingPrice;

  const impactItems = [
    'Product hidden from all customers',
    'Cannot receive new orders',
    'Affected customers notified (if subscribed)',
    sold7d > 0 ? `Last 7-day sales: ${sold7d} units (₹${revenue7d.toLocaleString('en-IN')})` : 'No sales recorded in the last 7 days',
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Out of Stock Alert" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="package" size={44} color={colors.error} />
          </View>
          <Text style={styles.heading}>Product is Out of Stock</Text>
          <Text style={styles.subtitle}>{product.name} has reached 0 units. It is now hidden from customers.</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="package" size={20} color={colors.error} />
            </View>
            <View style={styles.summaryTextColumn}>
              <Text style={styles.summaryName}>{product.name}</Text>
              <Text style={styles.summaryMeta}>
                SKU: {product.sku} · {product.categoryName}
              </Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>0 units · Hidden from customers</Text>
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
          <Button
            label="Remind me later"
            variant="outline"
            icon={<Icon name="clock" size={15} color={colors.textPrimary} />}
            onPress={() => {
              Alert.alert('Reminder set', "We'll remind you about this product later.");
              navigation.goBack();
            }}
          />
          <Button label="Keep hidden (no stock available)" variant="text" onPress={() => navigation.goBack()} />
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
