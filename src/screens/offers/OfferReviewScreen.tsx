import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, ScreenContainer } from '../../components';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferReview'>;

function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function OfferReviewScreen({ navigation }: Props) {
  const { draft, setReviewConfirmed, computedDurationLabel } = useOfferDraft();

  const offerName = draft.type?.name || 'Untitled Offer';
  const discountType = draft.type?.discountType ?? 'percentage';
  const discountValue = draft.discountValue.value;
  const typeLabel =
    discountType === 'flat' ? `₹${discountValue} Fixed Amount Off` : `${discountValue}% Percentage Discount`;

  const productCount = draft.products?.productCount ?? 0;
  const categoryLabel = draft.products?.categoryLabel ?? 'Entire Store';
  const productsLabel = `${categoryLabel} · ${productCount} products`;

  const durationLabel = computedDurationLabel() || 'Not set';

  const estimatedReach = Math.max(50, Math.round(productCount * 6.67));

  const expectedOrders = Math.max(1, Math.round(productCount * 1.75));
  const avgOrderValue = 245;
  const estimatedRevenue = expectedOrders * avgOrderValue;
  const avgDiscount =
    discountType === 'flat' ? discountValue : Math.round(((avgOrderValue * discountValue) / 100) * 100) / 100;

  const summaryRows = [
    { label: 'Offer Name', value: offerName },
    { label: 'Type', value: typeLabel },
    { label: 'Products', value: productsLabel },
    { label: 'Duration', value: durationLabel },
    { label: 'Est. Reach', value: `${estimatedReach} customers` },
  ];

  const impactStats = [
    { label: 'Expected orders', value: `${expectedOrders}` },
    { label: 'Est. revenue', value: formatINR(estimatedRevenue) },
    { label: 'Avg discount', value: `₹${avgDiscount.toFixed(2)}` },
  ];

  function handlePublish() {
    if (!draft.reviewConfirmed) return;
    navigation.navigate('PublishOffer');
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <OfferWizardHeader title="Review Offer" step={5} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Offer Summary</Text>
          {summaryRows.map((row, index) => (
            <View key={row.label} style={[styles.summaryRow, index > 0 && styles.summaryRowDivider]}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.impactCard}>
          <Text style={styles.impactHeading}>Estimated Impact</Text>
          <View style={styles.impactGrid}>
            {impactStats.map(stat => (
              <View key={stat.label} style={styles.impactTile}>
                <Text style={styles.impactValue}>{stat.value}</Text>
                <Text style={styles.impactLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.confirmRow}>
          <Checkbox checked={draft.reviewConfirmed} onToggle={setReviewConfirmed} />
          <Text style={styles.confirmText}>
            I&apos;ve reviewed all offer details and confirm they are correct.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Publish Offer" onPress={handlePublish} disabled={!draft.reviewConfirmed} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  summaryHeading: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.52,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  summaryRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  impactCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  impactHeading: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  impactTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  impactValue: {
    ...typography.captionBold,
    color: colors.primary,
  },
  impactLabel: {
    ...typography.tiny,
    fontSize: 10,
    color: '#047857',
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  confirmText: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
