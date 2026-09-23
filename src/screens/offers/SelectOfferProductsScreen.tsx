import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, ScreenContainer, SegmentedControl } from '../../components';
import { Icon } from '../../icons/Icon';
import { CATEGORIES } from '../../data/categories';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'SelectOfferProducts'>;

// Plausible per-category item counts (sums to the store's total catalog size).
const CATEGORY_ITEM_COUNTS: Record<string, number> = {
  'grocery-staples': 62,
  'dairy-eggs': 48,
  'fruits-vegetables': 35,
  'snacks-beverages': 41,
  'personal-care': 28,
  'household-cleaning': 19,
  'baby-kids': 12,
  'health-wellness': 9,
};

const TOTAL_PRODUCT_COUNT = Object.values(CATEGORY_ITEM_COUNTS).reduce((sum, count) => sum + count, 0);

type ToggleTab = 'categories' | 'products';

export function SelectOfferProductsScreen({ navigation }: Props) {
  const { updateProducts } = useOfferDraft();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ToggleTab>('categories');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CATEGORIES;
    return CATEGORIES.filter(category => category.name.toLowerCase().includes(query));
  }, [search]);

  const allSelected = selectedIds.size === CATEGORIES.length;
  const categoryCount = selectedIds.size;
  const productCount = useMemo(
    () =>
      CATEGORIES.filter(category => selectedIds.has(category.id)).reduce(
        (sum, category) => sum + (CATEGORY_ITEM_COUNTS[category.id] ?? 0),
        0,
      ),
    [selectedIds],
  );

  function toggleCategory(categoryId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(prev => (prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES.map(c => c.id))));
  }

  function handleNext() {
    const scope = allSelected ? 'entire-store' : 'selected-products';
    const categoryIds = Array.from(selectedIds);
    const categoryLabel = allSelected
      ? 'Entire Store'
      : CATEGORIES.filter(category => selectedIds.has(category.id))
          .map(category => category.name)
          .join(', ') || 'No categories selected';

    updateProducts({
      scope,
      categoryIds,
      categoryLabel,
      productCount: allSelected ? TOTAL_PRODUCT_COUNT : productCount,
    });
    navigation.navigate('OfferConditions');
  }

  const summaryText = allSelected
    ? 'Entire store selected'
    : `${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} · ${productCount} products selected`;

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Select Products" step={2} onBack={() => navigation.goBack()} />

      <View style={styles.topSection}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search categories or products…"
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

      {tab === 'categories' ? (
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Checkbox checked={allSelected} onToggle={toggleAll} />
                <Text style={styles.rowLabelSemibold}>All Products</Text>
              </View>
              <Text style={styles.rowCount}>{TOTAL_PRODUCT_COUNT} items</Text>
            </View>
          }
          renderItem={({ item }) => {
            const checked = selectedIds.has(item.id);
            return (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Checkbox checked={checked} onToggle={() => toggleCategory(item.id)} />
                  <Text style={checked ? styles.rowLabelSemibold : styles.rowLabel}>{item.name}</Text>
                </View>
                <Text style={styles.rowCount}>{CATEGORY_ITEM_COUNTS[item.id] ?? 0} items</Text>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.productsPlaceholder}>
          <Text style={styles.productsPlaceholderText}>
            Product-level selection is coming soon. Pick categories above to include their products in this offer.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.summaryText}>{summaryText}</Text>
        <View style={styles.footerButtonSpacer}>
          <Button label="Next: Offer Details" onPress={handleNext} disabled={categoryCount === 0} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
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
  productsPlaceholder: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
  productsPlaceholderText: {
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
