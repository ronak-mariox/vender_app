import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'OrderUpdated'>;

export function OrderUpdatedScreen({ navigation, route }: Props) {
  const { orderId, resolution, itemName, itemPrice, source } = route.params;
  const { getOrder, startQualityCheck, passQualityCheck } = useOrders();
  const order = getOrder(orderId);
  const [continuing, setContinuing] = useState(false);
  if (!order) return null;

  const bannerMessage =
    resolution === 'removed'
      ? '1 item removed · Customer notified via SMS · Refund initiated'
      : `1 item replaced with ${itemName} · Customer notified via SMS`;

  async function handleContinue() {
    if (continuing) return;
    if (source === 'qc') {
      setContinuing(true);
      try {
        await passQualityCheck(orderId);
        navigation.replace('QCPassed', { orderId });
      } catch (err) {
        Alert.alert('Could not update order', getApiErrorMessage(err));
      } finally {
        setContinuing(false);
      }
    } else {
      startQualityCheck(orderId);
      navigation.replace('QualityCheckFlow', { orderId });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Updated Order</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Modified</Text>
        </View>
      </View>

      <View style={styles.banner}>
        <Icon name="check-circle" size={14} color={colors.primaryDark} />
        <Text style={styles.bannerText}>{bannerMessage}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Confirmed Items ({order.products.length})</Text>
        <View style={styles.card}>
          {order.products.map((product, index) => (
            <View
              key={`${product.name}-${index}`}
              style={[styles.row, index < order.products.length - 1 && styles.rowDivider]}
            >
              <Icon name="check-circle" size={16} color={colors.primary} />
              <View style={styles.itemTextColumn}>
                <Text style={styles.name} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.meta}>
                  ×{product.qty} · ₹{product.price} each
                </Text>
              </View>
              <Text style={styles.total}>₹{product.price * product.qty}</Text>
            </View>
          ))}
        </View>

        {resolution === 'removed' ? (
          <View style={styles.removedCard}>
            <Icon name="x-circle" size={16} color={colors.error} />
            <View style={styles.itemTextColumn}>
              <Text style={styles.removedName}>{itemName}</Text>
              <Text style={styles.removedMeta}>Removed · ₹{itemPrice} refund initiated</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Items ({order.products.length})</Text>
            <Text style={styles.totalsValue}>₹{order.amount - order.deliveryCharge}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Delivery</Text>
            <Text style={styles.totalsValue}>₹{order.deliveryCharge}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={styles.newTotalLabel}>New Total</Text>
            <Text style={styles.newTotalValue}>₹{order.amount}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label={
            continuing ? 'Updating…' : source === 'qc' ? 'Continue to Packing →' : 'Proceed to Quality Check →'
          }
          onPress={handleContinue}
          background={colors.primary}
          textColor={colors.white}
          flex={1}
          disabled={continuing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  pill: {
    backgroundColor: colors.primarySurface,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  pillText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primaryDark,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTextColumn: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  total: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  removedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  removedName: {
    ...typography.labelSemibold,
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  removedMeta: {
    ...typography.tiny,
    color: colors.error,
  },
  totalsCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalsValue: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primaryBorder,
    marginVertical: spacing.xs,
  },
  newTotalLabel: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  newTotalValue: {
    fontSize: 16,
    fontFamily: fontFamilies.extrabold,
    lineHeight: 24,
    color: colors.primary,
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
