import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PackingStart'>;

const GUIDELINES = [
  'Use a sturdy paper/jute bag',
  'Separate liquids in a sealed inner bag',
  'Place heavy items at the bottom',
  'Include printed order receipt',
];

export function PackingStartScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pack Order</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Packing</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Items to Pack ({order.products.length})</Text>
          {order.products.map((product, index) => (
            <View
              key={`${product.name}-${index}`}
              style={[styles.itemRow, index < order.products.length - 1 && styles.itemRowDivider]}
            >
              <View style={styles.checkbox} />
              <View style={styles.itemTextColumn}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.itemQty}>×{product.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{product.price * product.qty}</Text>
            </View>
          ))}
        </View>

        <View style={styles.gap} />

        <View style={styles.panel}>
          <Text style={styles.sectionLabel}>Packing Guidelines</Text>
          {GUIDELINES.map((guideline, index) => (
            <View key={guideline} style={styles.guidelineRow}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.guidelineText}>{guideline}</Text>
            </View>
          ))}
        </View>

        {order.specialInstructions ? (
          <>
            <View style={styles.gap} />
            <View style={styles.panel}>
              <Text style={styles.sectionLabel}>Reminder</Text>
              <View style={styles.reminderCard}>
                <Icon name="alert-triangle" size={13} color={colors.warningDark} />
                <Text style={styles.reminderText}>
                  &quot;{order.specialInstructions}&quot; — Customer note
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="I've Started Packing"
          onPress={() => navigation.navigate('PackingInProgress', { orderId })}
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
    flex: 1,
  },
  pill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  pillText: {
    ...typography.tinyBold,
    color: '#EA580C',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  gap: {
    height: spacing.md,
    backgroundColor: colors.surface,
  },
  panel: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  itemTextColumn: {
    flex: 1,
    gap: 1,
  },
  itemName: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  itemQty: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    ...typography.tinyBold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  guidelineText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reminderText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
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
