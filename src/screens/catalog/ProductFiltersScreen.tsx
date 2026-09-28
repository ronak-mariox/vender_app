import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import {
  CATALOG_SORT_LABELS,
  CatalogSort,
  DEFAULT_CATALOG_FILTERS,
  ProductStatus,
  useProductCatalog,
} from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductFilters'>;

const SORT_OPTIONS = Object.keys(CATALOG_SORT_LABELS) as CatalogSort[];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export function ProductFiltersScreen({ navigation }: Props) {
  const { products, categories, catalogFilters, setCatalogFilters } = useProductCatalog();
  const [sort, setSort] = useState<CatalogSort>(catalogFilters.sort);
  const [statuses, setStatuses] = useState<ProductStatus[]>(catalogFilters.statuses);
  const [categoryIds, setCategoryIds] = useState<string[]>(catalogFilters.categoryIds);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  const activeFilterCount =
    statuses.length + categoryIds.length + (sort !== DEFAULT_CATALOG_FILTERS.sort ? 1 : 0);

  function toggleStatus(value: ProductStatus) {
    setStatuses(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  }

  function toggleCategory(id: string) {
    setCategoryIds(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]));
  }

  function handleReset() {
    setSort(DEFAULT_CATALOG_FILTERS.sort);
    setStatuses([]);
    setCategoryIds([]);
  }

  function handleApply() {
    setCatalogFilters({ sort, statuses, categoryIds });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <NavHeader title="Filter Products" onBack={() => navigation.goBack()} />
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sort By</Text>
          <View style={styles.optionList}>
            {SORT_OPTIONS.map(option => {
              const active = option === sort;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSort(option)}
                  style={[styles.sortRow, active && styles.sortRowActive]}
                >
                  <Text style={[styles.sortLabel, active && styles.sortLabelActive]}>{CATALOG_SORT_LABELS[option]}</Text>
                  {active ? (
                    <View style={styles.checkBubble}>
                      <Icon name="check" size={11} color={colors.white} strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Product Status</Text>
          <View style={styles.chipWrap}>
            {STATUS_OPTIONS.map(option => {
              const active = statuses.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleStatus(option.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category</Text>
          {categories.length === 0 ? <Text style={styles.categoryCount}>No categories available</Text> : null}
          {categories.map(category => (
            <Pressable
              key={category.id}
              style={styles.categoryRow}
              onPress={() => toggleCategory(category.id)}
            >
              <Checkbox checked={categoryIds.includes(category.id)} onToggle={() => toggleCategory(category.id)} />
              <Text style={styles.categoryLabel}>{category.name}</Text>
              <Text style={styles.categoryCount}>({categoryCounts[category.id] ?? 0})</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={`Apply Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
          onPress={handleApply}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    position: 'relative',
  },
  resetButton: {
    position: 'absolute',
    right: spacing.xxl,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  resetText: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.error,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.captionSemibold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  optionList: {
    gap: spacing.xs,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  sortRowActive: {
    backgroundColor: colors.primarySurface,
  },
  sortLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
  },
  sortLabelActive: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
  checkBubble: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.primary,
    fontFamily: fontFamilies.semibold,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryCount: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
