import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { isNonNegativeInteger, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductStockQuantity'>;

type Errors = FormErrors<'reorderLevel' | 'maxStock'>;

export function ProductStockQuantityScreen({ navigation }: Props) {
  const { draft, updateStock } = useProductDraft();
  const [opening, setOpening] = useState(draft.stock?.opening ?? 0);
  const [reorderLevel, setReorderLevel] = useState(draft.stock?.reorderLevel ?? '20');
  const [maxStock, setMaxStock] = useState(draft.stock?.maxStock ?? '500');
  const [trackAutomatically, setTrackAutomatically] = useState(draft.stock?.trackAutomatically ?? true);
  const [autoPause, setAutoPause] = useState(draft.stock?.autoPause ?? true);
  const [errors, setErrors] = useState<Errors>({});

  function handleContinue() {
    const nextErrors: Errors = {};
    if (!isNonNegativeInteger(reorderLevel.trim())) {
      nextErrors.reorderLevel = 'Enter a valid reorder level';
    }
    if (!isNonNegativeInteger(maxStock.trim())) {
      nextErrors.maxStock = 'Enter a valid max stock';
    }
    if (
      !nextErrors.reorderLevel &&
      !nextErrors.maxStock &&
      Number(reorderLevel) > Number(maxStock)
    ) {
      nextErrors.maxStock = 'Max stock must be at least the reorder level';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateStock({
      opening,
      reorderLevel: reorderLevel.trim(),
      maxStock: maxStock.trim(),
      trackAutomatically,
      autoPause,
    });
    navigation.navigate('ProductAvailability');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Stock Quantity"
        currentStep={9}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Opening Stock</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={styles.stepperField}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => setOpening(value => Math.max(0, value - 1))}
              >
                <Icon name="minus" size={18} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.stepperValue}>{opening}</Text>
              <Pressable
                style={[styles.stepperButton, styles.stepperButtonAdd]}
                onPress={() => setOpening(value => value + 1)}
              >
                <Icon name="plus" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={styles.helperText}>Current physical stock count</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="Reorder Level"
                value={reorderLevel}
                onChangeText={text => {
                  setReorderLevel(text.replace(/[^0-9]/g, ''));
                  if (errors.reorderLevel) setErrors(prev => ({ ...prev, reorderLevel: undefined }));
                }}
                keyboardType="numeric"
                helperText={errors.reorderLevel ? undefined : 'Alert when stock falls below'}
                error={errors.reorderLevel}
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Max Stock"
                value={maxStock}
                onChangeText={text => {
                  setMaxStock(text.replace(/[^0-9]/g, ''));
                  if (errors.maxStock) setErrors(prev => ({ ...prev, maxStock: undefined }));
                }}
                keyboardType="numeric"
                helperText={errors.maxStock ? undefined : 'Maximum capacity'}
                error={errors.maxStock}
              />
            </View>
          </View>
        </FormSectionCard>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextColumn}>
              <Text style={styles.toggleTitle}>Track Stock Automatically</Text>
              <Text style={styles.toggleSubtitle}>Reduce stock when orders are placed</Text>
            </View>
            <Switch value={trackAutomatically} onChange={setTrackAutomatically} />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowSpaced]}>
            <View style={styles.toggleTextColumn}>
              <Text style={styles.toggleTitle}>Auto-pause when Out of Stock</Text>
              <Text style={styles.toggleSubtitle}>Hide from customers when 0 stock</Text>
            </View>
            <Switch value={autoPause} onChange={setAutoPause} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
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
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  toggleRowSpaced: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleTextColumn: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
