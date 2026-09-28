import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { GST_ON_FEE_PERCENT_LABEL, PLATFORM_FEE_PERCENT_LABEL } from '../../constants/fees';
import { colors, radii, spacing, typography } from '../../theme';
import { PolicyMetaBar } from './PolicyMetaBar';
import { PolicySection } from './PolicySection';
import { usePolicyScroll } from './usePolicyScroll';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicySettlement'>;

type TimelineStep = {
  key: string;
  lineOne: string;
  lineTwo: string;
  isFinal?: boolean;
};

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'order', lineOne: 'Order', lineTwo: 'Delivered' },
  { key: 'settlement', lineOne: 'Settlement', lineTwo: 'Recorded' },
  { key: 'batch', lineOne: 'Payout', lineTwo: 'Batch' },
  { key: 'amount', lineOne: 'Amount', lineTwo: 'Credited', isFinal: true },
];

type DeductionRow = {
  label: string;
  value: string;
};

const DEDUCTION_ROWS: DeductionRow[] = [
  { label: 'Platform Commission', value: `${PLATFORM_FEE_PERCENT_LABEL} of items total` },
  { label: 'GST on Commission', value: `${GST_ON_FEE_PERCENT_LABEL} of commission` },
];

export function PolicySettlementScreen({ navigation }: Props) {
  const { progress, scrollProps } = usePolicyScroll();

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Settlement Policy" onBack={() => navigation.goBack()} />
      <PolicyMetaBar scrollProgress={progress} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} {...scrollProps}>
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
              </View>
            ))}
          </View>
        </View>

        <PolicySection
          heading="SETTLEMENT RECORDS"
          paragraphs={[
            'A settlement is recorded automatically for each order as soon as it is delivered. You can see every settlement, with its commission breakdown, under Payments.',
          ]}
        />

        <PolicySection
          heading="PAYOUTS"
          paragraphs={[
            'Recorded settlements are grouped into payout batches and transferred to the bank account on your profile. The status of each batch is shown under Payments.',
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
          heading="WHAT YOU RECEIVE"
          paragraphs={[
            'Your payout for an order is the items total plus tax, less the platform commission and GST on that commission. Delivery charges, platform fees and platform-funded coupons do not affect your payout.',
          ]}
        />

        <PolicySection
          heading="CANCELLED ORDERS"
          paragraphs={[
            'Orders that are cancelled or rejected are never delivered, so no settlement is recorded for them.',
          ]}
        />
      </ScrollView>
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
