import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { formatEventTimestamp } from '../../utils/time';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductStockDetails'>;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function ProductStockDetailsScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const { eventsForProduct } = useInventory();
  const product = products.find(item => item.id === productId);
  const events = useMemo(() => eventsForProduct(productId), [eventsForProduct, productId]);

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

  const lastRestock = events.find(event => event.delta > 0);
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const sold30d = events
    .filter(event => event.delta < 0 && event.timestamp >= cutoff)
    .reduce((sum, event) => sum + Math.abs(event.delta), 0);
  const avgDailySales = sold30d > 0 ? Math.max(1, Math.round(sold30d / 30)) : 0;
  const daysOfStock = avgDailySales > 0 ? Math.round(product.stock / avgDailySales) : null;

  const barHeight = Math.max(avgDailySales, 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Stock Details</Text>
          <Text style={styles.headerSubtitle}>{product.name}</Text>
        </View>
        <Pressable
          style={[styles.iconButton, styles.editButton]}
          onPress={() => navigation.navigate('UpdateQuantity', { productId })}
        >
          <Icon name="edit" size={16} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stockCard}>
          <View style={styles.stockMain}>
            <Text style={styles.stockValue}>{product.stock}</Text>
            <Text style={styles.stockLabel}>Units in Stock</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stockMetaColumn}>
            <Text style={styles.metaLabel}>Reorder Level</Text>
            <Text style={styles.metaValue}>{product.reorderLevel} units</Text>
            <Text style={[styles.metaLabel, styles.metaLabelSpaced]}>Max Capacity</Text>
            <Text style={styles.metaValue}>{product.maxStock} units</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stock Information</Text>
          <InfoRow label="SKU" value={product.sku} mono />
          {product.barcode ? <InfoRow label="Barcode" value={product.barcode} mono /> : null}
          <InfoRow label="Category" value={product.categoryName} />
          <InfoRow
            label="Last Restocked"
            value={lastRestock ? `${formatEventTimestamp(lastRestock.timestamp)} · +${lastRestock.delta} units` : 'No records yet'}
          />
          <InfoRow label="Sold (30d)" value={`${sold30d} units`} />
          <InfoRow label="Avg Daily Sales" value={avgDailySales > 0 ? `~${avgDailySales} units/day` : 'No recent sales data'} />
          <InfoRow
            label="Days of Stock"
            value={daysOfStock !== null ? `~${daysOfStock} days remaining` : 'Not enough data'}
            last
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sales (Last 7 Days)</Text>
          <View style={styles.chartRow}>
            {DAY_LABELS.map((day, index) => {
              const isToday = index === DAY_LABELS.length - 2;
              const heightPx = 20 + (barHeight * 6) / (index % 3 === 0 ? 1.4 : 1);
              return (
                <View key={`${day}-${index}`} style={styles.chartBarColumn}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: Math.min(60, heightPx) },
                      isToday && styles.chartBarActive,
                    ]}
                  />
                </View>
              );
            })}
          </View>
          <View style={styles.chartLabelsRow}>
            {DAY_LABELS.map((day, index) => (
              <Text key={`${day}-label-${index}`} style={styles.chartLabel}>
                {day}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryAction}
            onPress={() => navigation.navigate('UpdateQuantity', { productId })}
          >
            <Text style={styles.primaryActionText}>Update Quantity</Text>
          </Pressable>
          <Pressable
            style={styles.historyButton}
            onPress={() => navigation.navigate('InventoryHistory', { productId })}
          >
            <Icon name="refresh-cw" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.infoValueMono]} numberOfLines={1}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  stockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xxl,
  },
  stockMain: {
    flex: 1,
    alignItems: 'center',
  },
  stockValue: {
    fontSize: 42,
    fontFamily: fontFamilies.black,
    letterSpacing: -2.1,
    color: colors.primary,
  },
  stockLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  stockMetaColumn: {
    flex: 1,
    gap: spacing.md,
  },
  metaLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  metaLabelSpaced: {
    marginTop: spacing.sm,
  },
  metaValue: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 110,
  },
  infoValue: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  infoValueMono: {
    fontFamily: 'Courier',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 70,
  },
  chartBarColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: colors.primarySurface,
  },
  chartBarActive: {
    backgroundColor: colors.primary,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },
  chartLabel: {
    flex: 1,
    ...typography.tiny,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...typography.button,
    color: colors.white,
  },
  historyButton: {
    width: 52,
    height: 52,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
