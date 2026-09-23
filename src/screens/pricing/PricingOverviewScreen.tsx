import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PricingOverview'>;

export function PricingOverviewScreen({ navigation }: Props) {
  const { products } = useProductCatalog();

  const stats = useMemo(() => {
    const withMrp = products.filter(product => product.mrp > 0);
    const avgMrp = withMrp.length
      ? Math.round(withMrp.reduce((sum, product) => sum + product.mrp, 0) / withMrp.length)
      : 0;
    const avgDiscount = withMrp.length
      ? Math.round(
          withMrp.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) / product.mrp) * 100, 0) /
            withMrp.length,
        )
      : 0;
    return { total: products.length, avgMrp, avgDiscount };
  }, [products]);

  const recentUpdates = useMemo(
    () =>
      products
        .filter(product => product.updatedAt)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, 3),
    [products],
  );

  const categories = useMemo(() => {
    const map = new Map<string, { categoryId: string; categoryName: string; count: number; totalMrp: number }>();
    products.forEach(product => {
      const entry = map.get(product.categoryId) ?? {
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        count: 0,
        totalMrp: 0,
      };
      entry.count += 1;
      entry.totalMrp += product.mrp;
      map.set(product.categoryId, entry);
    });
    return Array.from(map.values())
      .map(entry => ({ ...entry, avgMrp: Math.round(entry.totalMrp / entry.count) }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Pricing</Text>
          <Text style={styles.subtitle}>Manage product prices</Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile value={String(stats.total)} label="Total Products" />
          <StatTile value={`₹${stats.avgMrp}`} label="Avg MRP" />
          <StatTile value={`${stats.avgDiscount}%`} label="Avg Discount" />
        </View>

        <Text style={styles.sectionLabel}>Recent Updates</Text>
        <View style={styles.card}>
          {recentUpdates.length === 0 ? (
            <Text style={styles.emptyText}>No recent price updates</Text>
          ) : (
            recentUpdates.map((product, index) => (
              <Pressable
                key={product.id}
                style={[styles.updateRow, index < recentUpdates.length - 1 && styles.rowDivider]}
                onPress={() => navigation.navigate('ProductPricingDetail', { productId: product.id })}
              >
                <View style={styles.updateTextColumn}>
                  <Text style={styles.updateName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.updateMeta}>
                    MRP ₹{product.mrp} · SP ₹{product.sellingPrice}
                  </Text>
                </View>
                <View style={styles.updatedPill}>
                  <Text style={styles.updatedPillText}>Updated</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <Text style={styles.sectionLabel}>By Category</Text>
        <View style={styles.card}>
          {categories.map((category, index) => (
            <Pressable
              key={category.categoryId}
              style={[styles.categoryRow, index < categories.length - 1 && styles.rowDivider]}
              onPress={() =>
                navigation.navigate('CategoryPricingList', {
                  categoryId: category.categoryId,
                  categoryName: category.categoryName,
                })
              }
            >
              <View style={styles.updateTextColumn}>
                <Text style={styles.updateName}>{category.categoryName}</Text>
                <Text style={styles.updateMeta}>{category.count} items</Text>
              </View>
              <View style={styles.categoryRightRow}>
                <Text style={styles.categoryAvg}>Avg ₹{category.avgMrp}</Text>
                <Icon name="chevron-right" size={16} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Bulk Price Update" onPress={() => navigation.navigate('CategoryPricingList', {})} />
      </View>
    </SafeAreaView>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  headerBlock: {
    paddingTop: spacing.xl,
    gap: 2,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fontFamilies.bold,
    color: colors.primary,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionLabel: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    padding: spacing.lg,
    textAlign: 'center',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  updateTextColumn: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  updateName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  updateMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  updatedPill: {
    backgroundColor: colors.primarySurface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  updatedPillText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  categoryRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryAvg: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
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
