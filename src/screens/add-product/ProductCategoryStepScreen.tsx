import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductCategoryStep'>;

export function ProductCategoryStepScreen({ navigation }: Props) {
  const { draft } = useProductDraft();
  const { categories, loading, refreshProducts } = useProductCatalog();
  const [selectedId, setSelectedId] = useState(draft.category?.categoryId ?? '');

  // Categories are otherwise only loaded once when the app starts, so a category an
  // admin adds after that would never show up here without this — refetch every
  // time a vendor actually lands on this step, since that's exactly when a stale
  // list matters most.
  useFocusEffect(
    useCallback(() => {
      refreshProducts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  function handleContinue() {
    if (!selectedId) return;
    navigation.navigate('ProductSubcategoryStep', { categoryId: selectedId });
  }

  const selectedCategory = categories.find(category => category.id === draft.category?.categoryId);

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Category"
        currentStep={3}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Choose the most relevant category so customers can find your product easily.
        </Text>

        {selectedCategory && draft.category ? (
          <View style={styles.breadcrumbChip}>
            <Text style={styles.breadcrumbText}>
              {draft.category.categoryName}
              <Text style={styles.breadcrumbSeparator}>  ›  </Text>
              {draft.category.subcategoryName}
            </Text>
            <Text style={styles.changeText}>Change</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        ) : (
          <View style={styles.card}>
            {categories.map((category, index) => {
              const selected = category.id === selectedId;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.row,
                    selected && styles.rowSelected,
                    index === categories.length - 1 && styles.rowLast,
                  ]}
                  onPress={() => setSelectedId(category.id)}
                >
                  <View style={[styles.iconWrapper, selected && styles.iconWrapperSelected]}>
                    <Icon name="package" size={22} color={selected ? colors.primary : colors.textSecondary} />
                  </View>
                  <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{category.name}</Text>
                  {selected ? (
                    <Icon name="check" size={16} color={colors.primary} strokeWidth={3} />
                  ) : (
                    <Icon name="chevron-right" size={14} color={colors.textTertiary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selectedId} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  intro: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  breadcrumbChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  breadcrumbText: {
    ...typography.captionSemibold,
    color: colors.primary,
    flex: 1,
  },
  breadcrumbSeparator: {
    color: colors.primary,
  },
  changeText: {
    ...typography.tiny,
    color: colors.primary,
  },
  loading: {
    paddingVertical: spacing.xxl,
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
  rowSelected: {
    backgroundColor: colors.primarySurface,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: 'rgba(28,166,114,0.13)',
  },
  rowLabel: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  rowLabelSelected: {
    fontFamily: fontFamilies.bold,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
});
