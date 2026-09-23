import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PackingInProgress'>;

export function PackingInProgressScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  const [packed, setPacked] = useState<Set<number>>(() => new Set());

  if (!order) return null;

  const total = order.products.length;
  const packedCount = packed.size;
  const pct = total > 0 ? Math.round((packedCount / total) * 100) : 0;

  function togglePacked(index: number) {
    setPacked(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Packing In Progress</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="package" size={24} color="#EA580C" />
            </View>
            <View style={styles.infoTextColumn}>
              <Text style={styles.infoTitle}>Packing {order.id}</Text>
              <Text style={styles.infoSubtitle}>Started 2 minutes ago</Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Packing progress</Text>
            <Text style={styles.progressValue}>
              {packedCount} / {total} packed
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>

        <View style={styles.productsSection}>
          {order.products.map((product, index) => {
            const isPacked = packed.has(index);
            return (
              <Pressable
                key={`${product.name}-${index}`}
                style={[styles.row, index < order.products.length - 1 && styles.rowDivider]}
                onPress={() => togglePacked(index)}
              >
                <View style={[styles.checkbox, isPacked && styles.checkboxPacked]}>
                  {isPacked ? <Icon name="check" size={14} color="#EA580C" strokeWidth={3} /> : null}
                </View>
                <Text style={[styles.name, isPacked && styles.namePacked]} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={[styles.status, isPacked && styles.statusPacked]}>
                  {isPacked ? 'Packed ✓' : 'Packing...'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Mark as Fully Packed"
          onPress={() => navigation.navigate('PackingComplete', { orderId })}
          background="#EA580C"
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
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  infoSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.xxl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextColumn: {
    gap: 1,
  },
  infoTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  infoSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressValue: {
    ...typography.tinyBold,
    color: '#EA580C',
  },
  track: {
    height: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: spacing.md,
    borderRadius: radii.full,
    backgroundColor: '#EA580C',
  },
  productsSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  checkboxPacked: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  name: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    flex: 1,
  },
  namePacked: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    fontFamily: fontFamilies.regular,
  },
  status: {
    ...typography.tinyBold,
    color: '#EA580C',
  },
  statusPacked: {
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
