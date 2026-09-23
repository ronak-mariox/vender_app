import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { getApiErrorMessage } from '../../services/api';
import { type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'EditStock'>;

type Errors = FormErrors<'count'>;

const REASONS = [
  'New Stock Purchase',
  'Return from Customer',
  'Manual Count Correction',
  'Damage / Expiry Removal',
  'Transfer from Branch',
  'Other',
];

export function EditStockScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();
  const product = products.find(item => item.id === productId);

  const [newCount, setNewCount] = useState(product?.stock ?? 0);
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Update Stock" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const delta = newCount - product.stock;

  async function handleUpdate() {
    if (saving) return;

    const nextErrors: Errors = {};
    if (delta === 0) {
      nextErrors.count = 'Change the stock count to record an update';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await recordStockChange({
        productId,
        newStock: newCount,
        reason,
        type: delta >= 0 ? 'purchase' : 'adjustment',
        reference: notes.trim() || undefined,
      });
      if (result?.wentOutOfStock) {
        navigation.replace('OOSConfirmation', { productId });
      } else {
        navigation.goBack();
      }
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err, 'Could not update stock. Please try again.') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Update Stock" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.productRow}>
            <View style={styles.productIcon}>
              <Icon name="package" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productMeta}>
                Current: <Text style={styles.productMetaBold}>{product.stock} units</Text>
              </Text>
            </View>
          </View>

          <View style={styles.stepperBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>New Stock Count</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.stepperField, errors.count && styles.stepperFieldError]}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => {
                  setNewCount(value => Math.max(0, value - 1));
                  if (errors.count) setErrors({});
                }}
              >
                <Icon name="minus" size={18} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.stepperValue}>{newCount}</Text>
              <Pressable
                style={[styles.stepperButton, styles.stepperButtonAdd]}
                onPress={() => {
                  setNewCount(value => value + 1);
                  if (errors.count) setErrors({});
                }}
              >
                <Icon name="plus" size={18} color={colors.primary} />
              </Pressable>
            </View>
            {errors.count ? <Text style={styles.errorText}>{errors.count}</Text> : null}
          </View>

          {delta !== 0 ? (
            <View style={styles.deltaBanner}>
              <Icon name="check-circle" size={14} color={colors.primaryDark} />
              <Text style={styles.deltaText}>
                {delta > 0 ? 'Adding ' : 'Removing '}
                <Text style={styles.deltaBold}>{Math.abs(delta)} units</Text>
                {delta > 0 ? ' to' : ' from'} current stock of {product.stock} →{' '}
                <Text style={styles.deltaBold}>{newCount} units</Text>
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.reasonTitle}>Adjustment Reason</Text>
          {REASONS.map((option, index) => {
            const selected = option === reason;
            return (
              <Pressable
                key={option}
                style={[styles.reasonRow, index < REASONS.length - 1 && styles.reasonRowDivider]}
                onPress={() => setReason(option)}
              >
                <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text style={[styles.reasonLabel, selected && styles.reasonLabelActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Invoice #INV-2024-0891"
        />

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Update Stock" onPress={handleUpdate} loading={saving} disabled={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  productMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  productMetaBold: {
    fontFamily: fontFamilies.bold,
    color: colors.primary,
  },
  stepperBlock: {
    paddingTop: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  stepperField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  stepperFieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    paddingTop: spacing.xs,
  },
  stepperButton: {
    width: 56,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonAdd: {
    backgroundColor: colors.primarySurface,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 32,
    fontFamily: fontFamilies.extrabold,
    color: colors.textPrimary,
  },
  deltaBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  deltaText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  deltaBold: {
    fontFamily: fontFamilies.bold,
  },
  reasonTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  reasonRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioInner: {
    width: 7,
    height: 7,
    borderRadius: 9999,
    backgroundColor: colors.white,
  },
  reasonLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  reasonLabelActive: {
    fontFamily: fontFamilies.semibold,
    color: colors.textPrimary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
