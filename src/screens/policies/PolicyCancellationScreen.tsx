import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyCancellation'>;

type ImpactTone = 'success' | 'warning' | 'error';

type ImpactRow = {
  stage: string;
  impact: string;
  tone: ImpactTone;
};

const CUSTOMER_ROWS: ImpactRow[] = [
  { stage: 'Placed (not yet accepted)', impact: 'Customer can cancel', tone: 'success' },
  { stage: 'Accepted', impact: 'Customer can cancel', tone: 'success' },
  { stage: 'Preparing or later', impact: 'Customer cannot cancel', tone: 'warning' },
];

const VENDOR_ROWS: ImpactRow[] = [
  { stage: 'Placed', impact: 'Reject with a reason', tone: 'success' },
  { stage: 'Accepted / Preparing', impact: 'Cancel with a reason', tone: 'warning' },
  { stage: 'Ready for pickup', impact: 'Cancel with a reason', tone: 'warning' },
  { stage: 'Out for delivery', impact: 'Cannot cancel', tone: 'error' },
];

const TONE_COLOR: Record<ImpactTone, string> = {
  success: colors.primary,
  warning: colors.warning,
  error: colors.error,
};

type Tab = 'customer' | 'vendor';

export function PolicyCancellationScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('customer');
  const rows = activeTab === 'customer' ? CUSTOMER_ROWS : VENDOR_ROWS;

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Cancellation Policy" onBack={() => navigation.goBack()} />
      <View style={styles.tabRow}>
        {(['customer', 'vendor'] as Tab[]).map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'customer' ? 'Customer Cancellation' : 'Vendor Cancellation'}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'customer' ? (
          <Text style={styles.intro}>
            {'Customers can cancel an order until you '}
            <Text style={styles.introBold}>start preparing</Text>
            {' it. You are notified of every customer cancellation.'}
          </Text>
        ) : (
          <Text style={styles.intro}>
            {'You can reject a new order, or cancel an accepted order until a delivery partner '}
            <Text style={styles.introBold}>picks it up</Text>
            {'. A reason is required and is shared with the customer.'}
          </Text>
        )}

        <Text style={styles.tableTitle}>
          {activeTab === 'customer' ? 'When customers can cancel' : 'When you can cancel'}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.stageColumn]}>ORDER STATUS</Text>
            <Text style={styles.tableHeaderCell}>RULE</Text>
          </View>
          {rows.map((row, index) => (
            <View key={row.stage} style={[styles.tableRow, index < rows.length - 1 && styles.tableRowDivider]}>
              <Text style={[styles.tableStage, styles.stageColumn]}>{row.stage}</Text>
              <Text style={[styles.tableImpact, { color: TONE_COLOR[row.tone] }]}>{row.impact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Stock for every item in a cancelled or rejected order is returned to your inventory automatically.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.labelSemibold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 22.1,
    color: colors.textSecondary,
  },
  introBold: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableTitle: {
    ...typography.labelSemibold,
    fontSize: 13,
    color: colors.textPrimary,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  tableHeaderCell: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stageColumn: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableStage: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tableImpact: {
    ...typography.bodySemibold,
    fontSize: 13,
  },
  callout: {
    marginTop: spacing.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: '#A7DEC7',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  calloutText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.primaryDark,
  },
});
