import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useDisputes } from '../../context/DisputesContext';
import { Button, Checkbox, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeAcceptIssue'>;

export function DisputeAcceptIssueScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, acceptDispute } = useDisputes();
  const dispute = getDispute(disputeId);
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!dispute) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Accept Issue" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleConfirm() {
    if (!confirmed || !dispute) return;
    acceptDispute(dispute.id);
    navigation.navigate('DisputeSettlementAdjustment', { disputeId: dispute.id });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Accept Issue" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dangerBanner}>
          <Text style={styles.dangerTitle}>You&apos;re accepting responsibility for this issue.</Text>
          <Text style={styles.dangerSubtitle}>Please review the details below before confirming.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adjustment Details</Text>
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Refund to Customer</Text>
              <Text style={styles.rowValue}>₹{dispute.claimAmount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Settlement Deduction</Text>
              <Text style={styles.rowValue}>₹{dispute.claimAmount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Applied To</Text>
              <Text style={styles.rowValue}>Next settlement</Text>
            </View>
          </View>
        </View>

        <View style={styles.successBanner}>
          <Icon name="check" size={15} color={colors.primaryDark} strokeWidth={2.5} />
          <Text style={styles.successBannerText}>
            This won&apos;t affect your store rating if done within 48 hours.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Note to Customer (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a message for the customer..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.confirmRow} onPress={() => setConfirmed(v => !v)} hitSlop={4}>
          <View pointerEvents="none">
            <Checkbox checked={confirmed} onToggle={setConfirmed} />
          </View>
          <Text style={styles.confirmRowText}>
            I accept this issue and authorize the ₹{dispute.claimAmount} adjustment from my next
            settlement.
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button label="Confirm & Accept" onPress={handleConfirm} disabled={!confirmed} />
        </View>
        <View style={styles.footerButton}>
          <SecondaryButton label="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
    >
      <Text style={styles.secondaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  dangerBanner: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.lg + 2,
  },
  dangerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.error,
  },
  dangerSubtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: '#9B1C1C',
    paddingTop: spacing.xs,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingTop: spacing.lg,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.lg + 2,
  },
  successBannerText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.primaryDark,
    flex: 1,
  },
  noteInput: {
    marginTop: spacing.md,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    width: '100%',
  },
  confirmRowText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  secondaryButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
