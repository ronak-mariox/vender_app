import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, NavHeader } from '../../components';
import { CATEGORIES } from '../../data/categories';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventoryFilter'>;

const STOCK_STATUS_OPTIONS = [
  { key: 'in-stock', label: 'In Stock', dotColor: colors.primary },
  { key: 'low-stock', label: 'Low Stock (below reorder level)', dotColor: colors.warning },
  { key: 'out-of-stock', label: 'Out of Stock', dotColor: colors.error },
  { key: 'unavailable', label: 'Inactive / Hidden', dotColor: colors.textSecondary },
];

export function InventoryFilterScreen({ navigation }: Props) {
  const [statuses, setStatuses] = useState<string[]>(['in-stock', 'low-stock']);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const activeCount = statuses.length + categoryIds.length;

  function toggleStatus(key: string) {
    setStatuses(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]));
  }

  function toggleCategory(id: string) {
    setCategoryIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  }

  function handleReset() {
    setStatuses([]);
    setCategoryIds([]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View>
        <NavHeader title="Filter Inventory" onBack={() => navigation.goBack()} />
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stock Status</Text>
          {STOCK_STATUS_OPTIONS.map((option, index) => {
            const checked = statuses.includes(option.key);
            return (
              <Pressable
                key={option.key}
                style={[styles.statusRow, index < STOCK_STATUS_OPTIONS.length - 1 && styles.statusRowDivider]}
                onPress={() => toggleStatus(option.key)}
              >
                <Checkbox checked={checked} onToggle={() => toggleStatus(option.key)} />
                <View style={[styles.dot, { backgroundColor: option.dotColor }]} />
                <Text style={styles.statusLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.quantityHeaderRow}>
            <Text style={styles.cardTitle}>Stock Quantity</Text>
            <Text style={styles.quantityValue}>0 – 500 units</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={styles.sliderFill} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map(category => {
              const active = categoryIds.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {category.name.split(' & ')[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={`Apply Filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
          onPress={() => navigation.goBack()}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.captionSemibold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  statusLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  quantityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityValue: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  sliderTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  sliderFill: {
    width: '100%',
    height: 6,
    backgroundColor: colors.primary,
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
