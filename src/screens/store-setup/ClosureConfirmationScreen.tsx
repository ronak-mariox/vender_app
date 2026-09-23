import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ClosureConfirmation'>;

export function ClosureConfirmationScreen({ navigation }: Props) {
  const { data, setStoreStatus } = useStoreSetup();
  const closure = data.tempClosure;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleConfirm() {
    if (!closure) {
      setError('Missing closure details — please go back and fill the form again.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await api.patch('/vendor/store-setup/temp-closure', closure);
      setStoreStatus('temporarily-closed');
      navigation.navigate('StoreStatus');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Confirm Closure" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle
            icon="pause-circle"
            size={72}
            iconSize={36}
            iconColor="#F79009"
            backgroundColor={colors.warningSurface}
          />
          <Text style={styles.heading}>Confirm Store Closure</Text>
          <Text style={styles.subtitle}>Review the impact before closing</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Closure Summary</Text>
          <SummaryRow label="Reason" value={closure?.reason ?? '—'} />
          <SummaryRow label="Closure Start" value={`${closure?.fromDate ?? '—'}, ${closure?.closeFromTime ?? ''}`} />
          <SummaryRow label="Reopening At" value={`${closure?.toDate ?? '—'}, ${closure?.reopenAt ?? ''}`} />
          <SummaryRow label="Duration" value="2 days" />
          <SummaryRow label="Customer Message" value={closure?.customMessage ?? '—'} last />
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Icon name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.impactTitle}>Impact on Active Orders</Text>
          </View>
          <View style={styles.impactRow}>
            <Icon name="package" size={18} color={colors.error} />
            <View style={styles.impactTextColumn}>
              <View style={styles.impactRowHeader}>
                <Text style={styles.impactLabel}>Pending orders</Text>
                <Text style={styles.impactValue}>3 orders</Text>
              </View>
              <Text style={styles.impactNote}>Must be fulfilled before closure</Text>
            </View>
          </View>
          <View style={[styles.impactRow, styles.impactRowDivider]}>
            <Icon name="package" size={18} color={colors.error} />
            <View style={styles.impactTextColumn}>
              <View style={styles.impactRowHeader}>
                <Text style={styles.impactLabel}>Active carts</Text>
                <Text style={styles.impactValue}>12 carts</Text>
              </View>
              <Text style={styles.impactNote}>Customers will be notified</Text>
            </View>
          </View>
        </View>

        <InfoBanner
          variant="success"
          message="Push notifications will be sent to customers with active carts once you confirm closure."
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <View style={styles.buttonRowItem}>
            <Button label="Go Back" variant="outline" onPress={() => navigation.goBack()} disabled={saving} />
          </View>
          <View style={styles.buttonRowItem}>
            <Button label="Confirm Closure" onPress={handleConfirm} loading={saving} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.summaryRow, !last && styles.summaryRowDivider]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    paddingBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  summaryRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 120,
  },
  summaryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    flex: 1,
  },
  impactCard: {
    backgroundColor: colors.errorSurface,
    borderWidth: 1.5,
    borderColor: colors.errorBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  impactTitle: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  impactRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  impactRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.errorBorder,
  },
  impactTextColumn: {
    flex: 1,
  },
  impactRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactLabel: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  impactValue: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  impactNote: {
    ...typography.tiny,
    color: colors.errorDark,
    paddingTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  buttonRowItem: {
    flex: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
});
