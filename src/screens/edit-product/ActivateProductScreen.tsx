import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'ActivateProduct'>;

const BENEFITS = [
  'Product visible to all customers',
  'Customers can add to cart and order',
  'Appears in category & search results',
];

export function ActivateProductScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, setProductStatus } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Activate Product" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const awaitingApproval = product.status === 'pending' || product.status === 'rejected';

  async function handleConfirm() {
    if (saving || awaitingApproval) return;
    setSaving(true);
    try {
      await setProductStatus(productId, 'active');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not activate product', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Activate Product" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="eye" size={44} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Activate Product?</Text>
          <Text style={styles.subtitle}>
            {product.status === 'pending'
              ? 'This product is still awaiting admin approval. It will go live once approved.'
              : product.status === 'rejected'
              ? `This product was rejected${product.rejectionReason ? `: ${product.rejectionReason}` : ''}. It can't be activated until an admin approves it.`
              : 'This product will become visible to customers and can receive orders immediately.'}
          </Text>

          <View style={styles.summaryCard}>
            <ProductThumb
              imageUrl={product.images?.[0]}
              style={styles.summaryIcon}
              iconSize={20}
              iconColor={colors.textSecondary}
            />
            <View style={styles.summaryTextColumn}>
              <Text style={styles.summaryName}>{product.name}</Text>
              <Text style={styles.summaryMeta}>
                ₹{product.sellingPrice} · {product.stock} in stock
              </Text>
            </View>
            <View style={styles.transitionRow}>
              <View style={styles.pillNeutral}>
                <Text style={styles.pillNeutralText}>Inactive</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={styles.pillActive}>
                <Text style={styles.pillActiveText}>Active</Text>
              </View>
            </View>
          </View>

          <View style={styles.benefitsCard}>
            {BENEFITS.map(benefit => (
              <View key={benefit} style={styles.benefitRow}>
                <Icon name="check-circle" size={14} color={colors.primaryDark} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Yes, Activate Product"
            onPress={handleConfirm}
            loading={saving}
            disabled={saving || awaitingApproval}
          />
          <Button label="Cancel" variant="outline" onPress={() => navigation.goBack()} disabled={saving} />
        </View>
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
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextColumn: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  summaryMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pillNeutral: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  pillNeutralText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  arrow: {
    ...typography.label,
    color: colors.textSecondary,
  },
  pillActive: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  pillActiveText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 2,
  },
  benefitText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
