import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { STOCK_REASONS } from '../../utils/inventory';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'UpdateQuantity'>;

type UpdateMode = 'set' | 'add' | 'remove';

const MODES: { key: UpdateMode; title: string; subtitle: string }[] = [
  { key: 'set', title: 'Set Exact', subtitle: 'Set to specific number' },
  { key: 'add', title: 'Add Stock', subtitle: 'Add to existing count' },
  { key: 'remove', title: 'Remove Stock', subtitle: 'Remove from count' },
];

export function UpdateQuantityScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products } = useProductCatalog();
  const { recordStockChange } = useInventory();
  const product = products.find(item => item.id === productId);

  const [mode, setMode] = useState<UpdateMode>('set');
  const [amount, setAmount] = useState(product?.stock ?? 0);
  const [reason, setReason] = useState(STOCK_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Update Stock" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  function handleModeChange(nextMode: UpdateMode) {
    setMode(nextMode);
    if (nextMode === 'set') setAmount(product!.stock);
    else setAmount(0);
  }

  const newQuantity =
    mode === 'set' ? amount : mode === 'add' ? product.stock + amount : Math.max(0, product.stock - amount);
  const delta = newQuantity - product.stock;

  async function handleSubmit() {
    if (!reason) {
      setError('Select a reason');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const result = await recordStockChange({
        productId,
        newStock: newQuantity,
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
      Alert.alert('Could not update stock', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Update Stock" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.productCard}>
          <View style={styles.productIcon}>
            <Icon name="package" size={20} color={colors.textSecondary} />
          </View>
          <View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productMeta}>
              Current stock: <Text style={styles.productMetaBold}>{product.stock} units</Text>
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Type</Text>
          <View style={styles.modeRow}>
            {MODES.map(item => {
              const active = item.key === mode;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.modeCard, active && styles.modeCardActive]}
                  onPress={() => handleModeChange(item.key)}
                >
                  <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{item.title}</Text>
                  <Text style={[styles.modeSubtitle, active && styles.modeSubtitleActive]}>{item.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{mode === 'set' ? 'New Quantity' : mode === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}</Text>
          <View style={styles.stepperField}>
            <Pressable style={styles.stepperButton} onPress={() => setAmount(value => Math.max(0, value - 1))}>
              <Icon name="minus" size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.stepperValue}>{amount}</Text>
            <Pressable
              style={[styles.stepperButton, styles.stepperButtonAdd]}
              onPress={() => setAmount(value => value + 1)}
            >
              <Icon name="plus" size={20} color={colors.primary} />
            </Pressable>
          </View>

          {delta !== 0 ? (
            <View style={styles.deltaBanner}>
              <Icon name="check-circle" size={14} color={colors.primaryDark} />
              <Text style={styles.deltaText}>
                {delta > 0 ? 'Adding ' : 'Removing '}
                <Text style={styles.deltaBold}>{Math.abs(delta)} units</Text> to reach{' '}
                <Text style={styles.deltaBold}>{newQuantity} total</Text>
              </Text>
            </View>
          ) : null}
        </View>

        <SelectField
          label="Reason"
          required
          value={reason}
          options={STOCK_REASONS}
          onChange={value => {
            setReason(value);
            if (error) setError(undefined);
          }}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="e.g. Invoice #INV-2024-0891" />

        <View style={styles.footer}>
          <Button label="Update Stock" onPress={handleSubmit} loading={saving} disabled={saving} />
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
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  modeCardActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  modeTitle: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modeTitleActive: {
    color: colors.primary,
  },
  modeSubtitle: {
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modeSubtitleActive: {
    color: colors.primaryDark,
  },
  stepperField: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  stepperButton: {
    width: 60,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonAdd: {
    backgroundColor: colors.primarySurface,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 40,
    fontFamily: fontFamilies.black,
    letterSpacing: -2,
    color: colors.textPrimary,
  },
  deltaBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  deltaText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  deltaBold: {
    fontFamily: fontFamilies.bold,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.md,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
