import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';
import { findFlaggedItem } from './flowMock';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductPicking'>;

export function ProductPickingScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, startQualityCheck } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const flagged = findFlaggedItem(order.products);
  const flaggedIndex = flagged ? order.products.indexOf(flagged) : -1;
  const checkedCount = flaggedIndex >= 0 ? flaggedIndex + 1 : order.products.length;
  const total = order.products.length;
  const pct = total > 0 ? Math.min(100, Math.round((checkedCount / total) * 100)) : 0;

  function handleContinue() {
    if (flagged) {
      navigation.navigate('ItemAvailability', { orderId });
    } else {
      startQualityCheck(orderId);
      navigation.replace('QualityCheckFlow', { orderId });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.textColumn}>
            <Text style={styles.title}>Pick Items</Text>
            <Text style={styles.subtitle}>
              {order.id} · {checkedCount} of {total} items checked
            </Text>
          </View>
          <Pressable hitSlop={8} style={styles.iconButton}>
            <Icon name="barcode" size={16} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Picking progress</Text>
          <Text style={styles.progressFraction}>
            {checkedCount} / {total}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.listCard}>
          {order.products.map((product, index) => {
            const isFlagged = index === flaggedIndex;
            const isPicked = flaggedIndex >= 0 ? index < flaggedIndex : true;
            return (
              <View
                key={`${product.name}-${index}`}
                style={[styles.row, isPicked && styles.rowPicked, isFlagged && styles.rowMissing]}
              >
                <View
                  style={[
                    styles.checkbox,
                    isPicked && styles.checkboxPicked,
                    isFlagged && styles.checkboxMissing,
                  ]}
                >
                  {isPicked ? <Icon name="check" size={14} color={colors.primary} strokeWidth={3} /> : null}
                  {isFlagged ? <Icon name="x" size={14} color={colors.error} strokeWidth={3} /> : null}
                </View>
                <View style={styles.textColumn}>
                  <Text style={[styles.name, isFlagged && styles.nameMissing]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.meta}>Qty: {product.qty} · Aisle 3, Shelf B</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.price}>₹{product.price * product.qty}</Text>
                  {isFlagged ? <Text style={styles.notFound}>Not found</Text> : null}
                </View>
              </View>
            );
          })}

          <View style={styles.scanRow}>
            <Icon name="barcode" size={14} color={colors.textSecondary} />
            <Text style={styles.scanText}>Scan barcode to mark item as picked</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label={flagged ? 'Continue — 1 item issue →' : 'Continue →'}
          onPress={handleContinue}
          background={flagged ? colors.warning : colors.primary}
          textColor={colors.white}
          flex={1}
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
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressFraction: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  track: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  listCard: {
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  rowPicked: {
    backgroundColor: '#F0FDF4',
  },
  rowMissing: {
    backgroundColor: colors.errorSurface,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxPicked: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  checkboxMissing: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.errorBorder,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  nameMissing: {
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  meta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  notFound: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fontFamilies.semibold,
    color: colors.error,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  scanText: {
    ...typography.caption,
    color: colors.textSecondary,
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
