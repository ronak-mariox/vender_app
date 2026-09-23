import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner } from '../../components';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';
import { PriceInputField } from './PriceInputField';

type Props = NativeStackScreenProps<AuthStackParamList, 'MRPEditor'>;

function recentChanges(currentMrp: number) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const steps = [
    { daysAgo: 9, delta: 0 },
    { daysAgo: 52, delta: -3 },
    { daysAgo: 90, delta: -6 },
  ];
  let runningTo = currentMrp;
  return steps.map(step => {
    const from = Math.max(1, runningTo + step.delta);
    const entry = {
      date: new Date(now - step.daysAgo * DAY).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      from,
      to: runningTo,
    };
    runningTo = from;
    return entry;
  });
}

export function MRPEditorScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [mrpText, setMrpText] = useState(String(product?.mrp ?? ''));
  const [saving, setSaving] = useState(false);

  if (!product) return null;

  const mrp = parseFloat(mrpText) || 0;
  const history = recentChanges(product.mrp);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await updateProduct(productId, { mrp, updatedAt: Date.now() });
      navigation.replace('PriceUpdated', {
        productId,
        headline: 'MRP',
        message: `MRP for ${product?.name} has been updated to ₹${mrp}.`,
      });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="MRP" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What is MRP?</Text>
          <Text style={styles.infoBody}>
            Maximum Retail Price is the manufacturer-set price. You cannot sell above MRP.
          </Text>
        </View>

        <PriceInputField label="MRP" value={mrpText} onChangeText={setMrpText} />

        <View style={styles.bannerWrapper}>
          <InfoBanner variant="info" message="Setting selling price above MRP is prohibited by law." />
        </View>

        <Text style={styles.sectionLabel}>Recent MRP Changes</Text>
        <View style={styles.card}>
          {history.map((entry, index) => (
            <View key={entry.date} style={[styles.historyRow, index < history.length - 1 && styles.rowDivider]}>
              <Text style={styles.historyDate}>{entry.date}</Text>
              <View style={styles.historyValueRow}>
                <Text style={styles.historyFrom}>₹{entry.from}</Text>
                <Text style={styles.historyArrow}>→</Text>
                <Text style={styles.historyTo}>₹{entry.to}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Save" onPress={handleSave} loading={saving} disabled={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  infoBody: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  bannerWrapper: {
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  historyFrom: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  historyArrow: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  historyTo: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
