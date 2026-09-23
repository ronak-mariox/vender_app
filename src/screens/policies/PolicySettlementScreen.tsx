import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';
import { PolicyMetaBar } from './PolicyMetaBar';
import { PolicySection } from './PolicySection';
import { PolicyScrollFooter } from './PolicyScrollFooter';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicySettlement'>;

type TimelineStep = {
  key: string;
  lineOne: string;
  lineTwo: string;
  day: string;
  isFinal?: boolean;
};

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'order', lineOne: 'Order', lineTwo: 'Delivered', day: 'Day 0' },
  { key: 'wait', lineOne: '48hr', lineTwo: 'Wait', day: 'Day 2' },
  { key: 'settlement', lineOne: 'Settlement', lineTwo: 'Initiated', day: 'Day 8' },
  { key: 'bank', lineOne: 'Bank', lineTwo: 'Processing', day: 'Day 9' },
  { key: 'amount', lineOne: 'Amount', lineTwo: 'Credited', day: 'Day 10', isFinal: true },
];

type DeductionRow = {
  label: string;
  value: string;
};

const DEDUCTION_ROWS: DeductionRow[] = [
  { label: 'Platform Commission', value: '8% of net sales' },
  { label: 'GST on Commission', value: '18% of commission' },
  { label: 'Other deductions', value: 'As applicable' },
];

export function PolicySettlementScreen({ navigation }: Props) {
  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Settlement Policy" onBack={() => navigation.goBack()} />
      <PolicyMetaBar lastUpdatedLabel="1 Oct 2024" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.heading}>SETTLEMENT TIMELINE</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineLine} />
            {TIMELINE_STEPS.map((step, index) => (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineCircle}>
                  {step.isFinal ? (
                    <Icon name="check" size={13} color={colors.primary} strokeWidth={2.5} />
                  ) : (
                    <Text style={styles.timelineCircleText}>{index + 1}</Text>
                  )}
                </View>
                <Text style={styles.timelineLabel} numberOfLines={1}>
                  {step.lineOne}
                </Text>
                <Text style={styles.timelineLabel} numberOfLines={1}>
                  {step.lineTwo}
                </Text>
                <Text style={styles.timelineDay}>{step.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <PolicySection
          heading="SETTLEMENT CYCLE"
          paragraphs={[
            'Settlements are processed every Monday for all orders delivered between the preceding Tuesday and Sunday. Funds are initiated to your registered bank account by end of business Monday.',
          ]}
        />

        <PolicySection
          heading="ELIGIBLE ORDERS"
          paragraphs={[
            'An order is eligible for settlement once it has been delivered and no dispute has been raised for 48 hours from the confirmed delivery timestamp.',
          ]}
        />

        <View style={styles.section}>
          <Text style={styles.heading}>DEDUCTIONS</Text>
          <View style={styles.deductionsCard}>
            {DEDUCTION_ROWS.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.deductionRow,
                  index % 2 === 1 && styles.deductionRowAlt,
                  index < DEDUCTION_ROWS.length - 1 && styles.deductionRowDivider,
                ]}
              >
                <Text style={styles.deductionLabel}>{row.label}</Text>
                <Text style={styles.deductionValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <PolicySection
          heading="BANK PROCESSING"
          paragraphs={[
            'After settlement is initiated by Verdant, allow 1–2 business days for your bank to credit the amount to your account. NEFT/IMPS timings apply.',
          ]}
        />

        <PolicySection
          heading="DISPUTES"
          paragraphs={[
            'Orders with an active dispute will have their settlement amount withheld until the dispute is resolved. Verdant aims to resolve disputes within 5 business days.',
          ]}
        />

        <PolicySection
          heading="MINIMUM PAYOUT"
          paragraphs={[
            'A minimum payout threshold of ₹100 applies. Balances below this amount will roll over to the next settlement cycle automatically.',
          ]}
        />
      </ScrollView>
      <PolicyScrollFooter
        mode="download-only"
        downloadLabel="Download Policy PDF"
        onDownload={() => Alert.alert('Download', 'Coming soon.')}
      />
    </ScreenContainer>
  );
}

const CIRCLE_SIZE = 28;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    paddingTop: spacing.xxl + 2,
    gap: spacing.md,
  },
  heading: {
    ...typography.captionSemibold,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  timelineRow: {
    flexDirection: 'row',
    position: 'relative',
    paddingTop: spacing.md,
  },
  timelineLine: {
    position: 'absolute',
    top: spacing.md + CIRCLE_SIZE / 2,
    left: CIRCLE_SIZE / 2,
    right: CIRCLE_SIZE / 2,
    height: 1,
    backgroundColor: colors.border,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  timelineCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timelineCircleText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  timelineLabel: {
    ...typography.tiny,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: typography.tinyBold.fontFamily,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  timelineDay: {
    ...typography.tiny,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingTop: 2,
  },
  deductionsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  deductionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  deductionRowAlt: {
    backgroundColor: colors.surface,
  },
  deductionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deductionLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
  },
  deductionValue: {
    ...typography.bodySemibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
