import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

type Mode = 'set' | 'delta';

type Row = {
  key: string;
  productId: string;
  variantId: string;
  name: string;
  variantLabel?: string;
  stock: number;
};

type RowResult = { status: 'ok'; newStock: number; wentOutOfStock: boolean } | { status: 'error'; message: string };

function parseValue(text: string, mode: Mode): number | null {
  const trimmed = text.trim();
  if (mode === 'set') return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
  return /^-?\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
}

export function BulkUpdateScreen({ navigation, route }: Props) {
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();

  const rows = useMemo<Row[]>(
    () =>
      products.flatMap(product => {
        const variants = product.variants ?? [];
        return variants.map(variant => ({
          key: `${product.id}:${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantLabel: variants.length > 1 ? variant.size : undefined,
          stock: variant.stock,
        }));
      }),
    [products],
  );
  const productsWithoutVariants = products.filter(product => (product.variants ?? []).length === 0).length;

  const [mode, setMode] = useState<Mode>('delta');
  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = new Set(route.params?.productIds ?? []);
    return new Set(rows.filter(row => ids.has(row.productId)).map(row => row.key));
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [fillValue, setFillValue] = useState('');
  const [results, setResults] = useState<Record<string, RowResult>>({});
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const selectedRows = rows.filter(row => selected.has(row.key));
  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  function valueFor(row: Row) {
    return values[row.key] ?? (mode === 'set' ? String(row.stock) : '');
  }

  function toggleSelected(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setValues({});
    setFormError(undefined);
  }

  function fillSelected() {
    if (parseValue(fillValue, mode) === null) {
      setFormError(mode === 'set' ? 'Enter a whole number to fill' : 'Enter a whole number (use - to remove)');
      return;
    }
    setFormError(undefined);
    setValues(prev => {
      const next = { ...prev };
      selectedRows.forEach(row => {
        next[row.key] = fillValue.trim();
      });
      return next;
    });
  }

  async function handleApply() {
    if (running) return;
    const plan: { row: Row; newStock: number }[] = [];
    for (const row of selectedRows) {
      const parsed = parseValue(valueFor(row), mode);
      if (parsed === null) {
        setFormError(`Enter a valid ${mode === 'set' ? 'quantity' : 'change'} for ${row.name}`);
        return;
      }
      const newStock = mode === 'set' ? parsed : row.stock + parsed;
      if (newStock < 0) {
        setFormError(`${row.name}${row.variantLabel ? ` (${row.variantLabel})` : ''} only has ${row.stock} units`);
        return;
      }
      if (newStock !== row.stock) plan.push({ row, newStock });
    }
    if (plan.length === 0) {
      setFormError('None of the selected rows change stock');
      return;
    }

    setFormError(undefined);
    setRunning(true);
    setResults({});
    for (const { row, newStock } of plan) {
      try {
        const result = await recordStockChange({
          productId: row.productId,
          variantId: row.variantId,
          newStock,
          reason: 'Bulk stock update',
          type: 'bulk',
        });
        setResults(prev => ({
          ...prev,
          [row.key]: { status: 'ok', newStock, wentOutOfStock: result.wentOutOfStock },
        }));
      } catch (err) {
        setResults(prev => ({ ...prev, [row.key]: { status: 'error', message: getApiErrorMessage(err) } }));
      }
    }
    setRunning(false);
    setFinished(true);
    setValues({});
  }

  const resultList = Object.values(results);
  const okCount = resultList.filter(result => result.status === 'ok').length;
  const errorCount = resultList.filter(result => result.status === 'error').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Bulk Stock Update" onBack={() => navigation.goBack()} />

      <View style={styles.modeRow}>
        {(['delta', 'set'] as Mode[]).map(item => (
          <Pressable
            key={item}
            style={[styles.modeOption, mode === item && styles.modeOptionActive]}
            onPress={() => switchMode(item)}
            disabled={running}
          >
            <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>
              {item === 'delta' ? 'Add / Remove' : 'Set Exact Count'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.selectionBanner}>
        <Pressable
          style={[styles.checkbox, allSelected && styles.checkboxChecked]}
          onPress={() => setSelected(allSelected ? new Set() : new Set(rows.map(row => row.key)))}
          disabled={running}
        >
          {allSelected ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
        </Pressable>
        <Text style={styles.selectionText}>{selectedRows.length} selected</Text>
        <Text style={styles.selectionHint}>{mode === 'delta' ? 'Enter +/- units per row' : 'Enter new count per row'}</Text>
      </View>

      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>No products with variants to update.</Text>
        ) : null}
        {rows.map(row => {
          const checked = selected.has(row.key);
          const result = results[row.key];
          return (
            <View key={row.key} style={[styles.row, checked && styles.rowActive]}>
              <Pressable
                style={[styles.checkbox, checked && styles.checkboxChecked]}
                onPress={() => toggleSelected(row.key)}
                disabled={running}
              >
                {checked ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
              </Pressable>
              <View style={styles.rowTextColumn}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {row.name}
                  {row.variantLabel ? ` · ${row.variantLabel}` : ''}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={2}>
                  {result?.status === 'ok'
                    ? `Updated to ${result.newStock} units${result.wentOutOfStock ? ' · now out of stock' : ''}`
                    : result?.status === 'error'
                    ? `Failed: ${result.message}`
                    : `Current: ${row.stock} units`}
                </Text>
              </View>
              {result ? (
                <Icon
                  name={result.status === 'ok' ? 'check-circle' : 'alert-circle'}
                  size={18}
                  color={result.status === 'ok' ? colors.primary : colors.error}
                />
              ) : null}
              <TextInput
                value={valueFor(row)}
                onChangeText={text => {
                  setValues(prev => ({ ...prev, [row.key]: text.replace(mode === 'set' ? /[^0-9]/g : /[^0-9-]/g, '') }));
                  if (!checked) toggleSelected(row.key);
                }}
                placeholder={mode === 'set' ? String(row.stock) : '+0'}
                placeholderTextColor={colors.textTertiary}
                keyboardType={mode === 'set' ? 'number-pad' : 'numbers-and-punctuation'}
                editable={!running}
                style={[styles.valueInput, checked && styles.valueInputActive]}
              />
            </View>
          );
        })}
        {productsWithoutVariants > 0 ? (
          <Text style={styles.emptyText}>
            {productsWithoutVariants} product{productsWithoutVariants === 1 ? ' has' : 's have'} no variants and can't
            be stock-updated.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {finished && resultList.length > 0 ? (
          <Text style={[styles.summaryText, errorCount > 0 && styles.summaryTextError]}>
            {okCount} updated{errorCount > 0 ? ` · ${errorCount} failed` : ''}
          </Text>
        ) : null}
        <View style={styles.fillRow}>
          <Text style={styles.fillLabel}>{mode === 'delta' ? 'Same change for selected:' : 'Same count for selected:'}</Text>
          <TextInput
            value={fillValue}
            onChangeText={text => setFillValue(text.replace(mode === 'set' ? /[^0-9]/g : /[^0-9-]/g, ''))}
            placeholder={mode === 'delta' ? '+10' : '50'}
            placeholderTextColor={colors.textTertiary}
            keyboardType={mode === 'set' ? 'number-pad' : 'numbers-and-punctuation'}
            style={styles.fillInput}
            editable={!running}
          />
          <Pressable onPress={fillSelected} disabled={running || selectedRows.length === 0} hitSlop={8}>
            <Text style={styles.fillButtonText}>Fill</Text>
          </Pressable>
        </View>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        <Button
          label={running ? 'Updating…' : `Apply to ${selectedRows.length} row${selectedRows.length === 1 ? '' : 's'}`}
          onPress={handleApply}
          disabled={selectedRows.length === 0 || running}
          loading={running}
        />
        {finished ? <Button label="Done" variant="outline" onPress={() => navigation.goBack()} disabled={running} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
  },
  modeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  modeText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.primary,
  },
  selectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionText: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  selectionHint: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowActive: {
    backgroundColor: colors.primarySurface,
  },
  rowTextColumn: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  rowMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  valueInput: {
    width: 72,
    height: 36,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    textAlign: 'center',
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    padding: 0,
  },
  valueInputActive: {
    borderColor: colors.primary,
  },
  footer: {
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  summaryTextError: {
    color: colors.error,
  },
  fillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fillLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  fillInput: {
    width: 72,
    height: 36,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.sm,
    textAlign: 'center',
    color: colors.textPrimary,
    padding: 0,
  },
  fillButtonText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
});
