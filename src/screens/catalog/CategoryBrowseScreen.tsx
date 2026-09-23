import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { CATEGORIES } from '../../data/categories';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'CategoryBrowse'>;

export function CategoryBrowseScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return CATEGORIES.filter(category => category.name.toLowerCase().includes(lower));
  }, [query]);

  function productCountFor(categoryId: string) {
    return products.filter(product => product.categoryId === categoryId).length;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Select Category" onBack={() => navigation.goBack()} />

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Icon name="search" size={15} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search categories..."
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>All Categories</Text>
        <View style={styles.card}>
          {categories.map((category, index) => (
            <Pressable
              key={category.id}
              style={[styles.row, index === categories.length - 1 && styles.rowLast]}
              onPress={() =>
                navigation.navigate('CategoryProductListing', { categoryId: category.id })
              }
            >
              <View style={styles.iconWrapper}>
                <Icon name={category.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryMeta}>
                  {category.subcategories.length} sub-categories · {productCountFor(category.id)} products
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    flex: 1,
    ...typography.caption,
    fontSize: 13,
    color: colors.textPrimary,
    padding: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  categoryMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
