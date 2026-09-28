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

type Props = NativeStackScreenProps<AuthStackParamList, 'DeactivateProduct'>;

export function DeactivateProductScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { products, setProductStatus } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [saving, setSaving] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Deactivate Product" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const consequences = [
    'Hidden from customer search and catalog',
    'Cannot receive new orders',
    'Can be reactivated anytime',
    `${product.stock} units remain in your inventory`,
  ];

  async function handleConfirm() {
    if (saving) return;
    setSaving(true);
    try {
      await setProductStatus(productId, 'inactive');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not deactivate product', getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Deactivate Product" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="eye-off" size={44} color={colors.warning} />
          </View>
          <Text style={styles.heading}>Deactivate Product?</Text>
          <Text style={styles.subtitle}>
            This product will be hidden from customers. Existing orders are not affected.
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
              <View style={styles.pillActive}>
                <Text style={styles.pillActiveText}>Active</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={styles.pillNeutral}>
                <Text style={styles.pillNeutralText}>Inactive</Text>
              </View>
            </View>
          </View>

          <View style={styles.consequencesCard}>
            <Text style={styles.consequencesTitle}>What happens when deactivated</Text>
            {consequences.map(consequence => (
              <View key={consequence} style={styles.consequenceRow}>
                <Icon name="alert-circle" size={13} color={colors.warningDark} />
                <Text style={styles.consequenceText}>{consequence}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Yes, Deactivate Product" onPress={handleConfirm} loading={saving} disabled={saving} />
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
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
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
  arrow: {
    ...typography.label,
    color: colors.textSecondary,
  },
  pillNeutral: {
    backgroundColor: colors.white,
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
  consequencesCard: {
    width: '100%',
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  consequencesTitle: {
    ...typography.captionBold,
    color: '#A16207',
    marginBottom: spacing.sm,
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  consequenceText: {
    ...typography.caption,
    color: '#A16207',
    flex: 1,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
