import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ProductVariantSummary } from '../../context/ProductCatalogContext';
import type { StockEventType } from '../../context/InventoryContext';
import { colors, radii, spacing, typography } from '../../theme';

/** Maps the vendor-facing adjustment reason to the backend stock event `type`. */
export function stockTypeForReason(reason: string, delta: number): StockEventType {
  switch (reason) {
    case 'New Stock Purchase':
      return 'purchase';
    case 'Return from Customer':
      return 'return';
    case 'Manual Count Correction':
      return 'correction';
    case 'Damage / Expiry Removal':
      return 'damage';
    default:
      return delta >= 0 ? 'adjustment' : 'correction';
  }
}

export function primaryVariantId(variants?: ProductVariantSummary[]): string | null {
  if (!variants || variants.length === 0) return null;
  return (variants.find(variant => variant.isPrimary) ?? variants[0]).id;
}

type Props = {
  variants: ProductVariantSummary[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
  label?: string;
};

/** Renders nothing for single-variant products — there's nothing to choose. */
export function VariantPicker({ variants, selectedId, onSelect, label = 'Variant' }: Props) {
  if (variants.length <= 1) return null;
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {variants.map(variant => {
          const active = variant.id === selectedId;
          return (
            <Pressable
              key={variant.id}
              onPress={() => onSelect(variant.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{variant.size}</Text>
              <Text style={[styles.chipMeta, active && styles.chipTextActive]}>{variant.stock} units</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function NoVariantsState() {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorTitle}>No variants on this product</Text>
      <Text style={styles.errorText}>
        Stock is tracked per variant, and this product has none. Edit the product to fix its listing before updating
        stock.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  row: {
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  chipText: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  chipMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },
  errorBox: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  errorTitle: {
    ...typography.captionSemibold,
    color: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
