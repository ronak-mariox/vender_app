import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InventoryRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { Product, useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventorySearch'>;

type SearchField = 'name' | 'sku' | 'barcode';

const FIELDS: { key: SearchField; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'sku', label: 'SKU' },
  { key: 'barcode', label: 'Barcode' },
];

function matches(product: Product, field: SearchField, query: string) {
  const lower = query.toLowerCase();
  if (field === 'name') return product.name.toLowerCase().includes(lower);
  if (field === 'sku') return product.sku.toLowerCase().includes(lower);
  return (product.barcode ?? '').toLowerCase().includes(lower);
}

export function InventorySearchScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const [query, setQuery] = useState('');
  const [field, setField] = useState<SearchField>('name');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter(product => matches(product, field, query.trim()));
  }, [products, field, query]);

  function handleMorePress(product: Product) {
    Alert.alert(product.name, 'Choose an action', [
      { text: 'Update Quantity', onPress: () => navigation.navigate('UpdateQuantity', { productId: product.id }) },
      { text: 'View Details', onPress: () => navigation.navigate('ProductStockDetails', { productId: product.id }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search inventory..."
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            autoFocus
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} style={styles.clearBubble} hitSlop={8}>
              <Icon name="x" size={11} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {FIELDS.map(item => {
          const active = item.key === field;
          return (
            <Pressable key={item.key} onPress={() => setField(item.key)} style={styles.tab}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {query.trim().length > 0 ? (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsHeaderText}>
            {results.length} result{results.length === 1 ? '' : 's'} for "{query.trim()}"
          </Text>
        </View>
      ) : null}

      {results.map(product => (
        <InventoryRow
          key={product.id}
          name={product.name}
          imageUrl={product.images?.[0]}
          sku={product.sku}
          onPress={() => navigation.navigate('ProductStockDetails', { productId: product.id })}
          right={
            <View style={styles.rightRow}>
              <StockPill product={product} />
              <Pressable onPress={() => handleMorePress(product)} hitSlop={8}>
                <Icon name="more-vertical" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          }
        />
      ))}
    </SafeAreaView>
  );
}

function StockPill({ product }: { product: Product }) {
  if (product.status === 'out-of-stock') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.errorSurface }]}>
        <Text style={[styles.pillText, { color: colors.error }]}>Out of Stock</Text>
      </View>
    );
  }
  if (product.status === 'low-stock') {
    return (
      <View style={[styles.pill, { backgroundColor: colors.warningSurface }]}>
        <Text style={[styles.pillText, { color: colors.warning }]}>{product.stock} — Low</Text>
      </View>
    );
  }
  return (
    <View style={[styles.pill, { backgroundColor: colors.primarySurface }]}>
      <Text style={[styles.pillText, { color: colors.primary }]}>{product.stock} units</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  clearBubble: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: spacing.md,
  },
  tabText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: fontFamilies.bold,
  },
  resultsHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  resultsHeaderText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillText: {
    ...typography.captionBold,
  },
});
