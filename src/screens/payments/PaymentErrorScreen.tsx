import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentError'>;

const POSSIBLE_REASONS = ['Account details changed', 'KYC expired or pending', 'Bank server downtime'];

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function PaymentErrorScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement, retrySettlement } = usePayments();
  const settlement = getSettlement(settlementId);

  function handleRetry() {
    retrySettlement(settlementId);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Payment Error" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="alert-circle" size={36} color={colors.error} />
          </View>
          <Text style={styles.heading}>Settlement Failed</Text>
        </View>

        <View style={styles.errorCard}>
          <View style={styles.errorRow}>
            <Text style={styles.errorLabel}>Settlement ID</Text>
            <Text style={styles.errorValue}>{settlement?.id ?? settlementId}</Text>
          </View>
          <View style={styles.errorRow}>
            <Text style={styles.errorLabel}>Amount</Text>
            <Text style={styles.errorValue}>{formatINR(settlement?.netPayout ?? 0)}</Text>
          </View>
          <View style={styles.errorReasonWrap}>
            <Text style={styles.errorReason}>
              {settlement?.failureReason ?? 'Bank account verification failed'}
            </Text>
          </View>
        </View>

        <View style={styles.reasonsSection}>
          <Text style={styles.reasonsTitle}>Possible Reasons</Text>
        </View>
        <View style={styles.reasonsList}>
          {POSSIBLE_REASONS.map((reason, index) => (
            <View
              key={reason}
              style={[styles.reasonRow, index < POSSIBLE_REASONS.length - 1 && styles.reasonRowDivider]}
            >
              <View style={styles.reasonDot} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            label="Update Bank Details"
            onPress={() => Alert.alert('Update Bank Details', 'Coming soon.')}
          />
          <Button
            label="Contact Support"
            variant="outline"
            onPress={() => Alert.alert('Contact Support', 'Coming soon.')}
          />
          <Button label="Retry Settlement" variant="text" onPress={handleRetry} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  errorLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  errorValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  errorReasonWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.errorBorder,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  errorReason: {
    ...typography.label,
    color: colors.error,
  },
  reasonsSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  reasonsTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  reasonsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  reasonRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  reasonText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
});
