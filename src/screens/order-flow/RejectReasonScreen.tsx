import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { useOrderAction } from '../orders/orderHelpers';

type Props = NativeStackScreenProps<AuthStackParamList, 'RejectReason'>;

const REASONS = [
  { label: 'Items out of stock', hint: 'One or more items unavailable' },
  { label: 'Store is too busy', hint: 'Cannot handle additional orders' },
  { label: 'Outside delivery area', hint: 'Delivery address is out of range' },
  { label: 'Order placed by mistake', hint: 'Customer may have ordered wrongly' },
  { label: 'Unable to prepare in time', hint: 'Insufficient time before deadline' },
  { label: 'Technical issue', hint: 'System or payment problem' },
  { label: 'Other', hint: 'Describe your reason below' },
];

export function RejectReasonScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { perform, busy: submitting } = useOrderAction(navigation);
  const [selected, setSelected] = useState(REASONS[0].label);
  const [note, setNote] = useState('');
  const needsNote = selected === 'Other';
  const trimmedNote = note.trim();
  const canSubmit = !submitting && (!needsNote || trimmedNote.length > 0);

  function handleConfirm() {
    if (!canSubmit) return;
    const reason = needsNote ? trimmedNote : trimmedNote ? `${selected}: ${trimmedNote}` : selected;
    perform('reject', orderId, reason);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Select Reject Reason</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Your reason helps us improve the platform and informs the customer.</Text>

        <View style={styles.card}>
          {REASONS.map((reason, index) => {
            const active = reason.label === selected;
            return (
              <Pressable
                key={reason.label}
                style={[
                  styles.reasonRow,
                  index < REASONS.length - 1 && styles.reasonRowDivider,
                  active && styles.reasonRowActive,
                ]}
                onPress={() => setSelected(reason.label)}
              >
                <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                  {active ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.reasonTextColumn}>
                  <Text style={[styles.reasonLabel, active && styles.reasonLabelActive]}>{reason.label}</Text>
                  <Text style={styles.reasonHint}>{reason.hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>{needsNote ? 'Describe your reason' : 'Additional note (optional)'}</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Explain in your own words..."
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.confirmButton, !canSubmit && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canSubmit}
        >
          <Text style={styles.confirmButtonText}>{submitting ? 'Rejecting…' : 'Confirm Rejection'}</Text>
        </Pressable>
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
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  reasonRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonRowActive: {
    backgroundColor: colors.errorSurface,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  radioInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  reasonTextColumn: {
    flex: 1,
    gap: 1,
  },
  reasonLabel: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  reasonLabelActive: {
    fontFamily: fontFamilies.bold,
    color: colors.error,
  },
  reasonHint: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  noteCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  noteLabel: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
  },
  noteInput: {
    ...typography.label,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  confirmButton: {
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
