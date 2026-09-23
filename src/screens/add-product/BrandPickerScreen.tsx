import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { POPULAR_BRANDS } from '../../data/categories';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'BrandPicker'>;

export function BrandPickerScreen({ navigation }: Props) {
  const { draft, updateBasicInfo } = useProductDraft();
  const [query, setQuery] = useState(draft.basicInfo?.brand ?? '');

  const results = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return POPULAR_BRANDS;
    return POPULAR_BRANDS.filter(brand => brand.toLowerCase().includes(lower));
  }, [query]);

  function selectBrand(brand: string) {
    updateBasicInfo({
      name: draft.basicInfo?.name ?? '',
      brand,
      manufacturer: draft.basicInfo?.manufacturer ?? '',
      countryOfOrigin: draft.basicInfo?.countryOfOrigin ?? 'India',
      shortDescription: draft.basicInfo?.shortDescription ?? '',
    });
    navigation.goBack();
  }

  const showAddNew = query.trim().length > 0 && !POPULAR_BRANDS.some(b => b.toLowerCase() === query.trim().toLowerCase());

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader title="Brand" currentStep={1} onBack={() => navigation.goBack()} />

      <View style={styles.searchWrapper}>
        <View style={styles.searchField}>
          <Icon name="search" size={16} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search or type a brand name"
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Popular Brands</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.brandRow} onPress={() => selectBrand(item)}>
            <View style={styles.brandIcon}>
              <Icon name="tag" size={14} color={colors.textSecondary} />
            </View>
            <Text style={styles.brandLabel}>{item}</Text>
            <Icon name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>
        )}
        ListFooterComponent={
          showAddNew ? (
            <Pressable style={styles.addNewButton} onPress={() => selectBrand(query.trim())}>
              <Icon name="plus" size={16} color={colors.textSecondary} />
              <Text style={styles.addNewText}>Add "{query.trim()}" as a new brand</Text>
            </Pressable>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  searchField: {
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
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  addNewText: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
});
