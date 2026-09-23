import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { PricingBackHeader } from './PricingBackHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'PriceReview'>;

function estimateDailyOrders(productId: string) {
  const sum = productId.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return 15 + (sum % 20);
}

export function PriceReviewScreen({ navigation, route }: Props) {
  const { productId, pendingMrp, pendingSellingPrice, changes } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!product) return null;

  const newSellingPrice = pendingSellingPrice ?? product.sellingPrice;
  const revenueImpactPerUnit = newSellingPrice - product.sellingPrice;
  const dailyOrders = estimateDailyOrders(productId);
  const monthlyImpact = revenueImpactPerUnit * dailyOrders * 30;

  const headline = pendingSellingPrice !== undefined ? 'Selling Price' : 'MRP';
  const message =
    pendingSellingPrice !== undefined
      ? `Selling price for ${product.name} has been updated to ₹${newSellingPrice}.`
      : `MRP for ${product.name} has been updated to ₹${pendingMrp}.`;

  async function handleApply() {
    if (saving) return;
    const patch: { mrp?: number; sellingPrice?: number; updatedAt: number } = { updatedAt: Date.now() };
    if (pendingMrp !== undefined) patch.mrp = pendingMrp;
    if (pendingSellingPrice !== undefined) patch.sellingPrice = pendingSellingPrice;
    setSaving(true);
    try {
      await updateProduct(productId, patch);
      navigation.replace('PriceUpdated', { productId, headline, message });
    } catch (err) {
      Alert.alert('Could not apply changes', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleSimulateFailure() {
    navigation.navigate('PriceUpdateError', {
      productId,
      pendingMrp,
      pendingSellingPrice,
      changes,
      headline,
      message,
      errorCode: 'selling_price_below_cost',
      errorField: 'selling_price',
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <PricingBackHeader title="Review Changes" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.colField]}>Field</Text>
            <Text style={[styles.tableHeaderText, styles.colValue]}>From</Text>
            <Text style={[styles.tableHeaderText, styles.colValue]}>To</Text>
          </View>
          {changes.map((change, index) => (
            <View key={change.field} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.colField]}>{change.field}</Text>
              <Text style={[styles.tableCellMuted, styles.colValue]}>{change.from}</Text>
              <Text style={[styles.tableCellStrong, styles.colValue]}>{change.to}</Text>
            </View>
          ))}
        </View>

        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Impact Analysis</Text>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Est. revenue impact</Text>
            <Text style={styles.impactValue}>
              {revenueImpactPerUnit >= 0 ? '+' : '-'}₹{Math.abs(revenueImpactPerUnit).toFixed(0)} / unit
            </Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Daily orders</Text>
            <Text style={styles.impactValue}>~{dailyOrders}</Text>
          </View>
          <View style={styles.impactRow}>
            <Text style={styles.impactLabel}>Monthly impact</Text>
            <Text style={styles.impactValue}>
              {monthlyImpact >= 0 ? '+' : '-'}₹{Math.abs(monthlyImpact).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <Pressable style={styles.confirmRow} onPress={() => setConfirmed(value => !value)}>
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed ? <Icon name="check" size={11} color={colors.white} strokeWidth={3} /> : null}
          </View>
          <Text style={styles.confirmText}>
            I confirm these prices are accurate and comply with platform guidelines.
          </Text>
        </Pressable>

        <Pressable hitSlop={8} style={styles.demoLinkWrapper} onPress={handleSimulateFailure}>
          <Text style={styles.demoLink}>Simulate Failure (Demo)</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Apply Changes" onPress={handleApply} disabled={!confirmed || saving} loading={saving} />
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
  productName: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  table: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tableHeaderText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    backgroundColor: colors.primarySurface,
  },
  colField: {
    flex: 1,
  },
  colValue: {
    flex: 1,
  },
  tableCell: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  tableCellMuted: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tableCellStrong: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  impactCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  impactTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  impactLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  impactValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  confirmText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  demoLinkWrapper: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  demoLink: {
    ...typography.tiny,
    color: colors.textTertiary,
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
