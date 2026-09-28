import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductSubcategoryStep'>;

export function ProductSubcategoryStepScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { categories } = useProductCatalog();
  const category = categories.find(item => item.id === categoryId);
  const { draft, updateCategory } = useProductDraft();
  const [selectedId, setSelectedId] = useState(
    draft.category?.categoryId === categoryId ? draft.category.subcategoryId : '',
  );

  function handleContinue() {
    const subcategory = category?.subcategories.find(item => item.id === selectedId);
    if (!category || !subcategory) return;
    updateCategory({
      categoryId: category.id,
      categoryName: category.name,
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
    });
    navigation.navigate('ProductDescriptionStep');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Sub-category"
        currentStep={3}
        onBack={() => navigation.goBack()}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
      />

      <View style={styles.breadcrumbRow}>
        <Text style={styles.breadcrumbText}>{category?.name}</Text>
        <Icon name="chevron-right" size={13} color={colors.textTertiary} />
        <Text style={styles.breadcrumbActive}>Select Sub-category</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {(category?.subcategories ?? []).map((subcategory, index) => {
            const selected = subcategory.id === selectedId;
            return (
              <Pressable
                key={subcategory.id}
                style={[
                  styles.row,
                  selected && styles.rowSelected,
                  index === (category?.subcategories.length ?? 0) - 1 && styles.rowLast,
                ]}
                onPress={() => setSelectedId(subcategory.id)}
              >
                <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{subcategory.name}</Text>
                {selected ? (
                  <Icon name="check" size={16} color={colors.primary} strokeWidth={3} />
                ) : (
                  <Icon name="chevron-right" size={14} color={colors.textTertiary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selectedId} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  breadcrumbText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breadcrumbActive: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
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
    justifyContent: 'space-between',
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
  rowLabel: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
