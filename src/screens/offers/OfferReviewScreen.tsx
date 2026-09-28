import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, ScreenContainer } from '../../components';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';
import {
  formatINR,
  formatOfferDateTime,
  offerEligibleProductCount,
  offerScopeLabel,
  offerTypeLabel,
} from './offerFormat';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferReview'>;

export function OfferReviewScreen({ navigation }: Props) {
  const { draft, setReviewConfirmed, validate } = useOfferDraft();
  const { products, categories } = useProductCatalog();
  const errors = validate();
  const errorMessages = Object.values(errors).filter((msg): msg is string => Boolean(msg));

  const coveredCount = offerEligibleProductCount(draft, products);
  const productsLabel = `${offerScopeLabel(draft, products, categories)} · ${coveredCount} product${coveredCount === 1 ? '' : 's'}`;
  const startLabel = draft.startImmediately ? 'Immediately on publish' : formatOfferDateTime(draft.startDate);

  const summaryRows = [
    { label: 'Offer Name', value: draft.title || 'Untitled Offer' },
    { label: 'Type', value: offerTypeLabel(draft) },
    { label: 'Products', value: productsLabel },
    {
      label: 'Min. Order',
      value: draft.minOrderValueEnabled ? formatINR(draft.minOrderValue) : 'None',
    },
    { label: 'Customers', value: draft.customerEligibility === 'new-only' ? 'New customers only' : 'All customers' },
    { label: 'Starts', value: startLabel },
    { label: 'Ends', value: formatOfferDateTime(draft.endDate) },
  ];

  const canPublish = draft.reviewConfirmed && errorMessages.length === 0;

  function handlePublish() {
    if (!canPublish) return;
    navigation.navigate('PublishOffer');
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <OfferWizardHeader title={draft.editingOfferId ? 'Review Changes' : 'Review Offer'} step={5} onBack={() => navigation.goBack()} />
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

        {errorMessages.length > 0 ? (
          <View style={styles.errorCard}>
            {errorMessages.map(message => (
              <Text key={message} style={styles.errorText}>
                • {message}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.confirmRow}>
          <Checkbox checked={draft.reviewConfirmed} onToggle={setReviewConfirmed} />
          <Text style={styles.confirmText}>
            I&apos;ve reviewed all offer details and confirm they are correct.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={draft.editingOfferId ? 'Save Changes' : 'Publish Offer'} onPress={handlePublish} disabled={!canPublish} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    backgroundColor: colors.errorSurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
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
