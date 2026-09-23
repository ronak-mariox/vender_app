import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'BulkUpdate'>;

export function BulkUpdateScreen({ navigation, route }: Props) {
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();

  const [selected, setSelected] = useState<Set<string>>(new Set(route.params?.productIds ?? []));
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map(product => [product.id, product.stock])),
  );
  const [bulkAmount, setBulkAmount] = useState(50);
  const [saving, setSaving] = useState(false);

  const selectedCount = selected.size;
  const allSelected = selectedCount === products.length;

  function toggleSelected(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(products.map(product => product.id)));
  }

  function adjustQuantity(id: string, delta: number) {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  }

  async function handleApply() {
    if (saving) return;
    setSaving(true);
    try {
      let lastOosProductId: string | undefined;
      for (const id of selected) {
        const newStock = Math.max(0, (quantities[id] ?? 0) + bulkAmount);
        const result = await recordStockChange({
          productId: id,
          newStock,
          reason: 'Bulk Stock Update',
          type: 'bulk',
        });
        if (result?.wentOutOfStock) lastOosProductId = id;
      }
      if (lastOosProductId) {
        navigation.replace('OOSConfirmation', { productId: lastOosProductId });
      } else {
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Could not apply bulk update', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Bulk Stock Update" onBack={() => navigation.goBack()} />

      <View style={styles.selectionBanner}>
        <Pressable style={styles.checkbox} onPress={toggleSelectAll}>
          {selectedCount > 0 ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
        </Pressable>
        <Text style={styles.selectionText}>{selectedCount} products selected</Text>
        <Pressable onPress={toggleSelectAll}>
          <Text style={styles.selectAllText}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.list}>
        {products.map(product => {
          const checked = selected.has(product.id);
          return (
            <View key={product.id} style={[styles.row, checked && styles.rowActive]}>
              <Pressable style={[styles.checkbox, checked && styles.checkboxChecked]} onPress={() => toggleSelected(product.id)}>
                {checked ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
              </Pressable>
              <View style={styles.rowTextColumn}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.rowSku} numberOfLines={1}>
                  {product.sku}
                </Text>
              </View>
              <View style={[styles.stepperField, checked && styles.stepperFieldActive]}>
                <Pressable style={styles.stepperButton} onPress={() => adjustQuantity(product.id, -1)}>
                  <Icon name="minus" size={12} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.stepperValue}>{quantities[product.id] ?? product.stock}</Text>
                <Pressable
                  style={[styles.stepperButton, styles.stepperButtonAdd]}
                  onPress={() => adjustQuantity(product.id, 1)}
                >
                  <Icon name="plus" size={12} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.bulkRow}>
          <View style={styles.bulkLabel}>
            <Text style={styles.bulkLabelText}>Add to all selected:</Text>
          </View>
          <View style={styles.bulkStepperField}>
            <Pressable style={styles.bulkStepperButton} onPress={() => setBulkAmount(value => value - 1)}>
              <Icon name="minus" size={14} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.bulkStepperValue}>{bulkAmount}</Text>
            <Pressable
              style={[styles.bulkStepperButton, styles.bulkStepperButtonAdd]}
              onPress={() => setBulkAmount(value => value + 1)}
            >
              <Icon name="plus" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
        <Button
          label={`Apply Bulk Update (${selectedCount} product${selectedCount === 1 ? '' : 's'})`}
          onPress={handleApply}
          disabled={selectedCount === 0 || saving}
          loading={saving}
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
  selectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionText: {
    ...typography.labelSemibold,
    color: colors.primary,
    flex: 1,
  },
  selectAllText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  rowActive: {
    backgroundColor: 'rgba(232,245,239,0.25)',
  },
  rowTextColumn: {
    flex: 1,
    gap: 1,
  },
  rowName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  rowSku: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  stepperField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  stepperFieldActive: {
    borderColor: colors.primary,
  },
  stepperButton: {
    width: 28,
    height: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonAdd: {
    backgroundColor: colors.primarySurface,
  },
  stepperValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  bulkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  bulkLabel: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  bulkLabelText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
  },
  bulkStepperField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  bulkStepperButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkStepperButtonAdd: {
    backgroundColor: colors.primarySurface,
  },
  bulkStepperValue: {
    ...typography.h3,
    fontSize: 15,
    color: colors.primary,
    minWidth: 36,
    textAlign: 'center',
  },
});
