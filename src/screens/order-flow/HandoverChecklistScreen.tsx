import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'HandoverChecklist'>;

const CHECKLIST = [
  'Order bag sealed and labelled',
  'Order receipt / slip included',
  'Fragile items packed separately',
  'Partner identity verified (app ID)',
  'Physical count confirmed with partner',
];

export function HandoverChecklistScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  const [checked, setChecked] = useState<boolean[]>([true, true, true, false, false]);

  if (!order) return null;

  const checkedCount = checked.filter(Boolean).length;

  function toggle(index: number) {
    setChecked(prev => prev.map((value, i) => (i === index ? !value : value)));
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Handover Checklist</Text>
        <Text style={styles.counter}>
          {checkedCount}/{CHECKLIST.length}
        </Text>
      </View>

      <View style={styles.partnerRow}>
        <View style={styles.avatar}>
          <Icon name="bike" size={16} color={colors.white} />
        </View>
        <View style={styles.partnerTextColumn}>
          <Text style={styles.partnerName}>Delivery partner</Text>
          <Text style={styles.partnerMeta}>Will be assigned shortly</Text>
        </View>
        <Pressable style={styles.callButton} onPress={() => Alert.alert('Call Partner', 'Coming soon.')}>
          <Icon name="phone" size={15} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {CHECKLIST.map((item, index) => {
            const isChecked = checked[index];
            return (
              <Pressable
                key={item}
                style={[
                  styles.row,
                  index < CHECKLIST.length - 1 && styles.rowDivider,
                  isChecked && styles.rowChecked,
                ]}
                onPress={() => toggle(index)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
                </View>
                <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Handing Over</Text>
          <Text style={styles.summaryOrderId}>ORD-2026-{order.id.replace('ORD-', '')}</Text>
          <Text style={styles.summaryMeta}>
            {order.customerName} · {order.location}
          </Text>
          <Text style={styles.summaryMeta}>
            {order.products.length} items · ₹{order.amount}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Report Issue"
          onPress={() => Alert.alert('Report Issue', 'Coming soon.')}
          background={colors.surface}
          textColor={colors.textSecondary}
          borderColor={colors.border}
          flex={1}
        />
        <FlexButton
          label="Confirm Handover →"
          onPress={() => navigation.navigate('HandoverConfirmation', { orderId })}
          background={colors.primary}
          textColor={colors.white}
          flex={1.6}
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
    borderRadius: radii.full,
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
  counter: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerTextColumn: {
    flex: 1,
    gap: 1,
  },
  partnerName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  partnerMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  callButton: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
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
  rowChecked: {
    backgroundColor: '#F0FDF4',
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemText: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  itemTextChecked: {
    color: colors.textSecondary,
    fontFamily: fontFamilies.regular,
    textDecorationLine: 'line-through',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 2,
  },
  summaryLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  summaryOrderId: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 13,
    color: colors.textPrimary,
    paddingTop: 2,
  },
  summaryMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
