import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, ScreenContainer, SegmentedControl } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';
import { formatINR } from './offerFormat';

type Props = NativeStackScreenProps<AuthStackParamList, 'SelectOfferProducts'>;

type ToggleTab = 'categories' | 'products';

function toggleIn(set: Set<string>, id: string) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function SelectOfferProductsScreen({ navigation }: Props) {
  const { draft, updateProducts } = useOfferDraft();
  const { products, categories, loading, error } = useProductCatalog();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ToggleTab>('categories');
  const [entireStore, setEntireStore] = useState(draft.scope === 'entire-store');
  const [categoryIds, setCategoryIds] = useState<Set<string>>(() => new Set(draft.categoryIds));
  const [productIds, setProductIds] = useState<Set<string>>(() => new Set(draft.productIds));

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  const query = search.trim().toLowerCase();
  const filteredCategories = useMemo(
    () => (query ? categories.filter(category => category.name.toLowerCase().includes(query)) : categories),
    [categories, query],
  );
  const filteredProducts = useMemo(
    () =>
      query
        ? products.filter(
            product =>
              product.name.toLowerCase().includes(query) ||
              product.categoryName.toLowerCase().includes(query) ||
              product.brand.toLowerCase().includes(query),
          )
        : products,
    [products, query],
  );

  const coveredProductCount = useMemo(() => {
    if (entireStore) return products.length;
    return products.filter(product => productIds.has(product.id) || categoryIds.has(product.categoryId)).length;
  }, [entireStore, products, productIds, categoryIds]);

  const hasSelection = entireStore || categoryIds.size > 0 || productIds.size > 0;

  function handleNext() {
    if (!hasSelection) return;
    updateProducts({
      scope: entireStore ? 'entire-store' : 'selected-products',
      categoryIds: entireStore ? [] : Array.from(categoryIds),
      productIds: entireStore ? [] : Array.from(productIds),
    });
    navigation.navigate('OfferConditions');
  }

  const summaryText = entireStore
    ? `Entire store selected · ${products.length} products`
    : hasSelection
      ? [
          categoryIds.size > 0 ? `${categoryIds.size} ${categoryIds.size === 1 ? 'category' : 'categories'}` : null,
          productIds.size > 0 ? `${productIds.size} ${productIds.size === 1 ? 'product' : 'products'}` : null,
        ]
          .filter(Boolean)
          .join(' + ') + ` · ${coveredProductCount} products covered`
      : 'Select the whole store, categories or individual products';

  const catalogEmpty = !loading && (tab === 'categories' ? categories.length === 0 : products.length === 0);

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Select Products" step={2} onBack={() => navigation.goBack()} />

      <View style={styles.topSection}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={tab === 'categories' ? 'Search categories…' : 'Search products…'}
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.segmentedWrapper}>
          <SegmentedControl
            options={[
              { label: 'Categories', value: 'categories' as ToggleTab },
              { label: 'Products', value: 'products' as ToggleTab },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>
      </View>

      <View style={styles.listHeaderWrapper}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Checkbox checked={entireStore} onToggle={() => setEntireStore(prev => !prev)} />
            <Text style={styles.rowLabelSemibold}>Entire Store</Text>
          </View>
          <Text style={styles.rowCount}>{products.length} items</Text>
        </View>
      </View>

      {loading && products.length === 0 && categories.length === 0 ? (
        <View style={styles.emptyBlock}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error && catalogEmpty ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : catalogEmpty ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText}>
            {tab === 'categories' ? 'No categories available.' : 'You have no products yet. Add products to your catalog first.'}
          </Text>
        </View>
      ) : tab === 'categories' ? (
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>No categories match “{search}”.</Text>}
          renderItem={({ item }) => {
            const checked = entireStore || categoryIds.has(item.id);
            return (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Checkbox
                    checked={checked}
                    onToggle={() => {
                      if (entireStore) return;
                      setCategoryIds(prev => toggleIn(prev, item.id));
                    }}
                  />
                  <Text style={checked ? styles.rowLabelSemibold : styles.rowLabel}>{item.name}</Text>
                </View>
                <Text style={styles.rowCount}>{productCountByCategory[item.id] ?? 0} items</Text>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.emptyText}>No products match “{search}”.</Text>}
          renderItem={({ item }) => {
            const viaCategory = categoryIds.has(item.categoryId);
            const checked = entireStore || viaCategory || productIds.has(item.id);
            return (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Checkbox
                    checked={checked}
                    onToggle={() => {
                      if (entireStore || viaCategory) return;
                      setProductIds(prev => toggleIn(prev, item.id));
                    }}
                  />
                  <View style={styles.rowTextColumn}>
                    <Text style={checked ? styles.rowLabelSemibold : styles.rowLabel} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.rowCount} numberOfLines={1}>
                      {viaCategory ? `Included via ${item.categoryName}` : item.categoryName}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rowCount}>{formatINR(item.sellingPrice)}</Text>
              </View>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.summaryText}>{summaryText}</Text>
        <View style={styles.footerButtonSpacer}>
          <Button label="Next: Offer Details" onPress={handleNext} disabled={!hasSelection} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 42,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  segmentedWrapper: {
    paddingTop: spacing.xs,
  },
  listHeaderWrapper: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingRight: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowLabelSemibold: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  rowCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowTextColumn: {
    flex: 1,
    gap: 2,
  },
  emptyBlock: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  summaryText: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  footerButtonSpacer: {
    paddingTop: spacing.md,
  },
});
