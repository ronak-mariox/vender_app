import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const IMPACT_ROWS: ImpactRow[] = [
  { stage: 'Before acceptance', impact: 'No penalty', tone: 'success' },
  { stage: 'After acceptance, before prep', impact: '0.5% rating impact', tone: 'warning' },
  { stage: 'After preparation starts', impact: '2% rating impact', tone: 'error' },
  { stage: 'Repeated cancellations', impact: 'Account review', tone: 'error' },
];

const TONE_COLOR: Record<ImpactTone, string> = {
  success: colors.primary,
  warning: colors.warning,
  error: colors.error,
};

type Tab = 'customer' | 'vendor';

export function PolicyCancellationScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('customer');

  function handleSelectTab(tab: Tab) {
    if (tab === 'vendor') {
      Alert.alert('Vendor Cancellation', 'Coming soon.');
      return;
    }
    setActiveTab(tab);
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Cancellation Policy" onBack={() => navigation.goBack()} />
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'customer' && styles.tabActive]}
          onPress={() => handleSelectTab('customer')}
        >
          <Text style={[styles.tabLabel, activeTab === 'customer' && styles.tabLabelActive]}>
            Customer Cancellation
          </Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => handleSelectTab('vendor')}>
          <Text style={styles.tabLabel}>Vendor Cancellation</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          {'Customers may cancel an order at any time before it has been '}
          <Text style={styles.introBold}>Accepted</Text>
          {' by the vendor at no penalty to either party. Once accepted, cancellations may affect your vendor rating as outlined below.'}
        </Text>

        <Text style={styles.tableTitle}>Vendor Impact on Customer Cancellation</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.stageColumn]}>STAGE</Text>
            <Text style={styles.tableHeaderCell}>VENDOR IMPACT</Text>
          </View>
          {IMPACT_ROWS.map((row, index) => (
            <View
              key={row.stage}
              style={[
                styles.tableRow,
                index < IMPACT_ROWS.length - 1 && styles.tableRowDivider,
              ]}
            >
              <Text style={[styles.tableStage, styles.stageColumn]}>{row.stage}</Text>
              <Text style={[styles.tableImpact, { color: TONE_COLOR[row.tone] }]}>
                {row.impact}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Vendors with a cancellation rate above 5% in any 30-day period will enter a
            performance review process.
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
